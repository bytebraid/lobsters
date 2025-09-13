
import theme from "theme";
import React from "react";
// import ReactPlayer from 'react-player'
import { Theme, Link, Section, Text, Structure, Box, Button, Icon, LinkBox } from "@quarkly/widgets";
import { Helmet } from "react-helmet";
import { GlobalQuarklyPageStyles } from "../global-page-styles";
import { RawHtml, Override } from "@quarkly/components";
import * as Components from "components";
import { FaTwitterSquare, FaPatreon, FaYoutube } from "react-icons/fa/index.js";
import RequireAuth from "../auth/Tools"

export default ( (props) => {
      return  <Theme theme={theme}>
        <GlobalQuarklyPageStyles pageUrl={"index"} />
		<Helmet>
        		<title>
					Lobster Tank
				</title>
			<meta name={"description"} content={"SHOETHROWING CONTROL"} />
			<link rel={"shortcut icon"} href={"/favicon.ico"} type={"image/x-icon"} />
		</Helmet>		

		<Section width="100%" display="flex" background='rgb(200, 0, 0) url("/images/THREHSOLDLOGO.fcba9be5.png") center top / contain no-repeat border-box'/>
	
		<Section
			padding="75px 0 75px 0"
			sm-padding="40px 0"
			background="linear-gradient(180deg,#1f2123,rgba(31,33,35,.5),#1f2123), url(/images/dumpsterFire.3c58a91f.jpg) "
			background-size="cover"
			background-repeat="no-repeat"
			background-position="0% 50%"
			display="flex"
			flex-direction="column"
			opacity="100"
			color="--grey"
			font="16px --fontFamily-googleOswald"
			position="relative"
			z-index="60"
			blur="(0.35px)"
		>
			<Override
				slot="SectionContent"
				flex-direction="row"
				justify-content="space-between"
				md-flex-direction="column"
				md-align-items="center"
				md-justify-content="center"
				md-text-align="center"
				font="oblique small-caps 16px &quot;Oswald&quot;, sans-serif"
			/>
			<Text
				as="h1"
				margin="0px"
				font="normal normal 600 95px/1.2 --fontFamily-googleOswald"
				md-font="--headline2"
				color="--lightD2"
				width="100%"
				md-width="100%"
				md-margin="0px 0px 16px 0px"
				border-color="#ffffff"
				text-align="center"
			>
				LOBSTER TANK 
			</Text>
			<Structure
				cells-number-total="2"
				cells-number-group="2"
				margin="20px 0px 10px 0px"
				padding="0px 0px 24px 0px"
				height="30px"
			>
				<Override
					slot="Content"
					grid-template-columns="9fr 1fr"
					md-grid-template-columns="repeat(6, 2fr)"
					sm-grid-template-columns="12fr"
					flex="0 0 auto"
					align-self="auto"
					display="block"
					order="0"
					text-align="left"
				>
					<Override
						slot="Cell 0th"
						grid-column="auto / auto"
						grid-row="auto"
						md-grid-column="1 / span 6"
						md-grid-row="span"
						sm-grid-column="auto"
						sm-grid-row="span"
						height="auto"
						display="block"
						sm-display="block"
						sm-text-align="center"
						sm-text-transform="uppercase"
						md-text-align="center"
						lg-text-transform="uppercase"
					/>
					<Override
						slot="Cell 1st"
						md-grid-column="9/ span 3"
						sm-grid-column="auto"
						width="200px"
						md-display="block"
						md-order="1"
						md-text-align="right"
						md-width="auto"
						lg-width="300px"
						sm-width="100px"
						sm-display="grid"
					/>
					<Override slot="cell-0">
						<Text 
							margin="0px 0px 0px 0px"
							font="28px --fontFamily-googleSixtyfour"
							width="100%"
							text-align="center"
							display="inline-block"
							lg-display="table-column-group"

						>
							Wesley Snips' surf and turf express takeout
						</Text>
					</Override>
					<Override slot="cell-1">
						<Text
							margin="0px 0px 0px 0px"
							text-align="right"
							font="16px --fontFamily-googleHennyPenny"
							display="block"
							md-display="block"
							md-justify-content="flex-end"
							md-align-content="center"
							md-width="100px"
						/>
					</Override>
					<Override slot="Cell 0" order="0" />
					{"                                    "}
				</Override>
			</Structure>
		</Section>
		<Structure
			cells-number-total="1"
			cells-number-group="1"

			id="loading"
			display="flex"
			align-items="flex-start"
			justify-content="center"
			align-content="center"
			padding="10px 0px 10px 0px"
			min-height="1280px"
			height="auto"
		>
			<Override
				slot="Content"
				grid-template-columns="9fr 3fr"
				md-grid-template-columns="repeat(1, 2fr)"
				sm-grid-template-columns="12fr"
				min-height="1280px"
			>
						<Text 
							margin="0px 0px 0px 0px"
							font="28px --fontFamily-googleSixtyfour"
							width="100%"
							text-align="center"
							display="inline-block"
							lg-display="table-column-group"

						>
							Wesley's Dubplates
						</Text>

				<RequireAuth>
				<Components.shows products="" />
				
					<Button
						background="--color-green"
						font="normal 550 42px/1.2 --fontFamily-googleOswald"
						border="darkcyan groove 4px"
						border-width="4px"
						border-radius="60px"
						padding="0 24px 0 24px"
						hover-background="#00f25a"
						onClick={() => {  fetch("/bisque/skip", {
            	method: 'GET',
            	headers: {
              	  'Content-type': 'application/json',                
            	},            	
        		});}}
					>
						SKIP
					</Button>
					

					<Button
						margin="20px 0px 20px 0px"
						border="darkorange groove 4px"						
						border-width="4px"
						background="--color-orange"
						font="normal 550 42px/1 --fontFamily-googleOswald"
						border-radius="60px"
						padding="0 24px 0 24px"
						id="restart"
						hover-background="#ffc807"
						onClick={async () => {  let response = await fetch("/bisque/live", {
            				method: 'GET',
			            	headers: {
			              	  'Content-type': 'application/json',                
			            	},            	
			        		});
							let jso = await response.json()
							document.getElementById("endpoint").innerHTML = '<u>Stream Endpoint</u>: <a target="_new" href="'+jso["endpoint"]+'">Click for connection details</a><br /><u>Endpoint expires</u>: '+jso["expires"]+'<br/><b>STREAM SAMPLERATE MUST BE 44100Hz</b><br/>'
						}}
					>
						GO LIVE
					</Button>
					<Button
						background="rgb(140, 0, 0)"
						border="palevioletred groove 4px"
						border-width="4px"
						font="normal 1000 40px/1.2 --fontFamily-googleOswald"
						border-radius="60px"
						padding="0 0 0 0"
						hover-background="rgba(255, 0, 0, 1.00)"
					>
						KILL ALL THE THINGS
					</Button>
					</RequireAuth>
				</Override>

	
		</Structure>


		<Section
			padding="80px 0 50px 0"
			background="linear-gradient(180deg,#1f2123,rgba(31,33,35,.9),#1f2123), url(/images/threshwax.jpg) 0% 0%/66% fixed "
			background-position="center"
			quarkly-title="Footer-17"
			position="static"
			flex-direction="row-reverse"
			display="grid"
		>
			<Override slot="SectionContent" justify-content="flex-start" />
			<Box
				display="flex"
				grid-template-columns="repeat(5, 1fr)"
				grid-gap="16px 24px"
				md-align-self="flex-start"
				justify-content="flex-start"
				flex-wrap="no-wrap"
				margin="0px 0px 25px 0px"
			>
				<LinkBox href="https://twitter.com/thisisthreshold" target="_blank">
					<Icon
						category="fa"
						icon={FaTwitterSquare}
						size="24px"
						color="#c3c8d0"
						hover-color="white"
						transition="background-color 1s ease 0s"
					/>
				</LinkBox>
				<LinkBox href="/">
					<Icon
						category="fa"
						icon={FaPatreon}
						size="24px"
						color="#c3c8d0"
						hover-color="white"
						transition="background-color 1s ease 0s"
					/>
				</LinkBox>
				<LinkBox href="/">
					<Icon
						category="fa"
						icon={FaYoutube}
						size="24px"
						color="#c3c8d0"
						hover-color="white"
						transition="background-color 1s ease 0s"
					/>
				</LinkBox>
			</Box>
			<Box
				display="flex"
				lg-width="100%"
				flex-direction="row"
				lg-flex-direction="column"
				justify-content="space-between"
				width="100%"
				padding="0 0px 0 0px"
				sm-flex-direction="column"
				sm-padding="0 0px 0 0px"
			>
				<Box
					lg-margin="0px 0px 0px 0px"
					width="50%"
					display="flex"
					lg-width="70%"
					sm-width="100%"
					flex-direction="column"
					padding="0px 50px 0px 0px"
					lg-padding="0px 0 0px 0px"
					sm-margin="0px 0px 35px 0px"
				>
					<Text margin="0px 0px 20px 0px" font="900 2.5em --fontFamily-googleComfortaa" color="--light" letter-spacing="1px">
						DROP BEANS NOT BOMBS
					</Text>
					<Text
						margin="0 0px 35px 0px"
						font="1.20em --fontFamily-googleComfortaa"
						color="#c3c8d0"
						sm-text-align="left"
						sm-margin="0 0px 0 0px"
						lg-max-width="640px"
					>
						Because there's nothing quite like like a few pingers rattling around in your nut.™
					</Text>
				</Box>
				<Box
					min-width="100px"
					min-height="100px"
					grid-template-columns="repeat(2, 1fr)"
					grid-gap="54px"
					lg-align-items="start"
					md-grid-template-columns="repeat(3, 1fr)"
					md-grid-gap="36px 34px"
					sm-grid-template-columns="1fr"
					sm-grid-gap="16px 0"
					justify-content="flex-end"
					sm-flex-direction="column"
					display="flex"
					lg-justify-content="flex-start"
					lg-display="flex"
				>
					<Box
						align-items="flex-start"
						lg-align-items="flex-start"
						justify-content="flex-start"
						display="grid"
						lg-flex-direction="column"
						lg-margin="0px 0px 0px 0px"
						flex-direction="column"
						flex-wrap="wrap"
						margin="0px 50px 0px 0px"
						align-content="start"
						grid-gap="10px 0"
					>
						<Link
							border-color="--color-primary"
							display="flex"
							font="normal 1000 28px/1.0 --fontFamily-googleComfortaa"
							margin="0px 0 0px 0"
							lg-border-width="0px 0px 0px 2px"
							href="#"
							text-decoration-line="initial"
							color="#c3c8d0"
							hover-color="#ffffff"
							letter-spacing="1px"
						>
							TAKE
						</Link>
						<Link
							margin="0px 0 0px 0"
							display="flex"
							href="#"
							font="normal 1000 28px/1.0 --fontFamily-googleComfortaa"
							text-decoration-line="initial"
							color="#c3c8d0"
							hover-color="#ffffff"
							letter-spacing="1px"
						>
							OFF
						</Link>
						<Link
							margin="0px 0 0px 0"
							hover-color="#ffffff"
							href="#"
							text-decoration-line="initial"
							color="#c3c8d0"
							font="normal 1000 28px/1.0 --fontFamily-googleComfortaa"
							display="flex"
							letter-spacing="1px"
						>
							YOUR
						</Link>
						<Link
							margin="0px 0 0px 0"
							hover-color="#ffffff"
							href="#"
							font="normal 1000 28px/1.0 --fontFamily-googleComfortaa"
							text-decoration-line="initial"
							color="#c3c8d0"
							display="flex"
							letter-spacing="1px"
						>
							SHOES
						</Link>
					</Box>
					<Box
						align-items="flex-start"
						margin="0px 0px 0px 0"
						lg-align-items="flex-start"
						justify-content="flex-start"
						display="grid"
						lg-flex-direction="column"
						lg-margin="0px 0px 0px 0px"
						flex-direction="column"
						align-content="start"
						grid-gap="10px 0"
					>
						<Link
							border-color="--color-primary"
							display="flex"
							font="normal 1000 28px/1.0 --fontFamily-googleComfortaa"
							margin="0px 0 0px 0"
							lg-border-width="0px 0px 0px 2px"
							href="#"
							text-decoration-line="initial"
							color="#c3c8d0"
							hover-color="#ffffff"
							letter-spacing="1px"
						>
							AND
						</Link>
						<Link
							margin="0px 0 0px 0"
							display="flex"
							href="#"
							font="normal 1000 28px/1.0 --fontFamily-googleComfortaa"
							text-decoration-line="initial"
							color="#c3c8d0"
							hover-color="#ffffff"
							letter-spacing="1px"
						>
							TURN
						</Link>
						<Link
							margin="0px 0 0px 0"
							hover-color="#ffffff"
							href="#"
							text-decoration-line="initial"
							color="#c3c8d0"
							font="normal 1000 28px/1.0 --fontFamily-googleComfortaa"
							display="flex"
							letter-spacing="1px"
						>
							UP THE
						</Link>
						<Link
							margin="0px 0 0px 0"
							hover-color="#ffffff"
							href="#"
							font="normal 1000 28px/1.0 --fontFamily-googleComfortaa"
							text-decoration-line="initial"
							color="#c3c8d0"
							display="flex"
							letter-spacing="1px"
						>
							BASS
						</Link>
					</Box>
				</Box>
			</Box>
			<Box
				display="flex"
				justify-content="space-between"
				padding="0px 0px 0px 0px"
				border-color="#232a44"
				md-padding="30px 0px 0px 0px"
				md-flex-direction="column"
				lg-padding="40px 0px 0px 0px"
				align-items="flex-end"
				height="auto"
				md-align-items="flex-start"
				font="1.5em --fontFamily-googleComfortaa"
				width="50% content-box"
				max-width="inherit"
			>
				<Text margin="0px 0px 0px 0px" font="normal 300 16px/.5 --fontFamily-googleComfortaa" color="#c3c8d0" md-margin="0px 0px 25px 0px">
					© COPYRIGHT YOUR MUM  (All rights reserved)
				</Text>
			</Box>
		</Section>
		<RawHtml>
			<style place={"endOfHead"} rawKey={"65c19cac0072400020e99b44"}>
				{":root {\n  box-sizing: border-box;\n}\n\n* {\n  box-sizing: inherit;\n}"}
			</style>
		</RawHtml>
		</Theme>
	
});