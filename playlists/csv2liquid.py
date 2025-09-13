#!/usr/bin/python3
import csv
import os
import json
import tempfile
import shutil
from pathlib import Path
from hashlib import blake2b
from urllib.parse import urlparse
from contextlib import chdir
import argparse

parser = argparse.ArgumentParser(
    prog="csv2liquid.py",
    formatter_class=argparse.RawDescriptionHelpFormatter,
    description="""Parse your CSV catalogue file into two .m3u playlists.\n
- all.m3u
  Contains everything not filtered into alternative.m3u

- alternate.m3u
  Contain only content filtered by artist matching the --alternative STRING

  Radio rotates between playlists by default.
""",
    epilog="Praise sweet baby Jeezus!",
)

parser.add_argument(
    "-a",
    "--alternative",
    default="noalternativem3ufile",
    help="Artist to match for alternative playlist. e.g. -a Beatles (for only Beatles songs)",
)
parser.add_argument(
    "filename",
    default="media.csv",
    help="Your content catalogue file (default: ./media.csv)",
)
args = parser.parse_args()


def strip_scheme(url: str) -> str:
    schemaless = urlparse(url)._replace(scheme="").geturl()
    return schemaless[2:] if schemaless.startswith("//") else schemaless


allowed_keys = ["title", "artist", "coverurl", "videourl", "comment", "date", "show"]


stream_dir = Path(__file__).parent.absolute()
finalize_sh = "finalize.sh"
update_docker_sh = "update-docker.sh"

with open(args.filename, "r") as thresh:
    rs = csv.reader(thresh)
    header = next(rs)
    labels = tuple(header)
    dr = csv.DictReader(thresh, labels)
    target_dir = stream_dir
    with chdir(stream_dir):
        with (
            tempfile.NamedTemporaryFile(
                suffix=".tmp", prefix="all", dir=target_dir, delete=False
            ) as main,
            tempfile.NamedTemporaryFile(
                suffix=".tmp", prefix="alternate", dir=target_dir, delete=False
            ) as alternative,
            tempfile.NamedTemporaryFile(
                suffix=".tmp", prefix="dbase", dir=target_dir, delete=False, mode="w+"
            ) as dbase,
            tempfile.NamedTemporaryFile(
                suffix=".tmp", prefix="hash", dir=target_dir, delete=False, mode="w+"
            ) as hbase,
        ):
            dbs = []
            hashes = {}
            for row in dr:
                str = "annotate:"
                h = blake2b(digest_size=16)
                h.update(json.dumps(row).encode("UTF-8"))
                hash = h.hexdigest()
                id = json.dumps(hash)

                items = []
                items.append(f"hash={id}")
                try:
                    cov = json.dumps(strip_scheme(row["coverurl"]))
                    if len(cov) > 0:
                        items.append(f"coveruri={cov}")
                except Exception:
                    pass
                for key in row:
                    if key in allowed_keys:
                        item = json.dumps(row[key])
                        items.append(f"{key}={item}")

                str += ",".join(items)
                str += f':wget:{row["url"]}\n'
                if args.alternative in row["artist"]:
                    alternative.write(str.encode("UTF-8"))
                else:
                    main.write(str.encode("UTF-8"))
                outrow = dict(row)
                outrow.update({"hash": hash})
                dbs.append(outrow)
                outrow.update({"m3u": str})
                hashes.update({hash: outrow})

            json.dump(dbs, dbase, indent=2)
            json.dump(hashes, hbase, indent=2)

        print(f"List created -> {main.name}")
        print(f"List created -> {alternative.name}")
        print(f"DB created -> {dbase.name}")
        print(f"Hashes created -> {hbase.name}")

        altout = f"'{target_dir}/alternate.m3u'"
        allout = f"'{target_dir}/all.m3u'"
        if os.path.exists(finalize_sh):
            os.remove(finalize_sh)
        if os.path.exists(update_docker_sh):
            os.remove(update_docker_sh)
        with open(finalize_sh, "w") as f:
            print(
                f"""#!/bin/bash
### COPY + PASTE THESE COMMANDS AS NEEDED ###
/bin/rm -vf {altout} {allout};
cp -vf "{hbase.name}" "hbase.json";
cp -vf "{dbase.name}" "dbase.json";

# Remove the shuf pipe to preserve order

cat "{alternative.name}" | shuf > {altout};
cat "{main.name}" | shuf > {allout}
rm -vf *.tmp
    """,
                file=f,
            )
        print("Run finalize.sh to overwrite existing playlists and JSON data.")
        os.chmod(finalize_sh, 0o755)
        with open(update_docker_sh, "w") as f:
            print(
                f"""#!/bin/bash
######### OPTIONAL #####################################
### UPDATE PLAYLISTS IN AN ALREADY RUNNING CONTAINER ###
###                                                  ###
docker cp {altout} tank:/var/app/playlists/{altout}
docker cp {allout} tank:/var/app/playlists/{allout}
docker cp hbase.json tank:/var/app/playlists/hbase.json
docker cp dbase.json tank:/var/app/playlists/dbase.json
    """,
                file=f,
            )
        os.chmod(update_docker_sh, 0o755)
        print("[OPTIONAL] Run update-docker.sh to install the playlists in a running container")
