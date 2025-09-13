import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import Linkify from 'react-linkify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faCog } from '@fortawesome/free-solid-svg-icons';
import config from '../Config/config.json';
import substringsToRemove from '../Config/substringsToRemove.json';
import userStyles from '../Config/styleConfig.json';
import linesToIgnore from '../Config/linesToIgnore.json';

const styleConfig: { [key: string]: any } = userStyles;
const colorValues = Object.keys(styleConfig);
const { websocketHost } = config;

const client = new W3CWebSocket(
  `${websocketHost}` 
);

type Props = {};

type State = {
  logHistory: string[];
  fontSize: number;
  settingsMenuExpanded: boolean;
};

class Terminal extends Component {
  state: State;

  constructor(props: Props) {
    super(props);

    this.state = {      
      logHistory: [],
      fontSize: 8,
      settingsMenuExpanded: false
    };

    this.increaseFontSize = this.increaseFontSize.bind(this);
    this.decreaseFontSize = this.decreaseFontSize.bind(this);
  }

  componentWillMount() {
    client.onopen = () => {
      console.log('Connected to log file.');
    };
    client.onmessage = message => {
      const { logHistory } = this.state;
      logHistory.unshift(message.data);
      if (logHistory.length > 5000) {
        logHistory.pop();
      }
      this.setState({
        logHistory
      });
    };
    client.onerror = () => {
      const { logHistory } = this.state;
      logHistory.push("CONNECTION ERROR - REFRESH PAGE");
      this.setState({logHistory});
    }
    client.onclose = () => {
      const { logHistory } = this.state;
      logHistory.push("SOCKET CLOSED - REFRESH PAGE");
      this.setState({logHistory});
    }
  }

  increaseFontSize = () => {
    const { fontSize } = this.state;
    if (fontSize > 1) {
      this.setState({
        fontSize: fontSize - 1
      });
    }
  };

  decreaseFontSize = () => {
    const { fontSize } = this.state;
    if (fontSize < 7) {
      this.setState({
        fontSize: fontSize + 1
      });
    }
  };

  toggleSettingsMenu = () => {
    const { settingsMenuExpanded } = this.state;
    this.setState({
      settingsMenuExpanded: !settingsMenuExpanded
    });
  };

  render() {
    const { logHistory, fontSize, settingsMenuExpanded } = this.state;

    return (
      <div className="terminal">
        {!settingsMenuExpanded && (
          <div className="settings has-text-right">
            <span
              className="button is-small is-black"
              onClick={this.toggleSettingsMenu}
            >
              <FontAwesomeIcon icon={faCog} />
            </span>
          </div>
        )}
        {settingsMenuExpanded && (
          <div className="notification settings swing-in-top-fwd box is-dark">
            <span
              className="delete has-text-danger"
              onClick={this.toggleSettingsMenu}
            ></span>
            <strong>
              <p className="help has-text-light">Font Size</p>
            </strong>
            <span
              className="button is-small is-dark"
              onClick={this.decreaseFontSize}
            >
              <FontAwesomeIcon icon={faMinus} />
            </span>
            <span
              className="button is-small is-dark"
              onClick={this.increaseFontSize}
            >
              <FontAwesomeIcon icon={faPlus} />
            </span>
          </div>
        )}
        {logHistory.map((line, index) => {
          // don't print empty messages
          if (line.trim() === '') {
            return null;
          }

          // ignore the line if it is in linesToIgnore.json
          let showLine: boolean = true;
          linesToIgnore.forEach((string: string) => {
            if (line.includes(string)) {
              showLine = false;
            }
          });
          if (!showLine) {
            return null;
          }

          // let's determine the log styles based on styleConfig.json
          let logStyles: string = '';
          colorValues.forEach((color: string) => {
            const { strings } = styleConfig[color];
            strings.forEach((string: string) => {
              if (line.includes(string)) {
                logStyles = styleConfig[color].class;
              }
            });
          });

          // Trim substrings that are in the substringsToRemove.json file
          let logText: string = line;
          substringsToRemove.forEach(string => {
            logText = logText.replace(string, '');
          });

          // finally print the log message
          return (
            <Linkify key={index}>
              <span
                className={`is-family-monospace ${logStyles} is-size-${String(
                  fontSize
                )}`}
              >
                {logText}
              </span>
            </Linkify>
          );
        })}
      </div>
    );
  }
}

export default Terminal;
