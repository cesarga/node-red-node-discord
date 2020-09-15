import { Node, NodeInitializer } from 'node-red';
import { Bot } from '../lib/Bot';
import {
  IBot,
  IConnectConfig,
  IDiscordChannelConfig,
  IToDiscordChannel,
} from '../lib/interfaces';
import { MemberMonitor } from '../lib/MemberMonitor';

// TODO: Add more user options
const nodeInit: NodeInitializer = (RED): void => {
  RED.nodes.registerType('discord-monitor-members', function (
    this: Node,
    props: IDiscordChannelConfig,
  ) {
    const node = this;
    RED.nodes.createNode(node, props);
    const configNode = RED.nodes.getNode(props.token) as IConnectConfig;
    const { token } = configNode;
    if (token) {
      const botInstance = new Bot();
      botInstance
        .get(token)
        .then((bot: IBot) => {
          node.addListener('input', (msg: IToDiscordChannel) => {
            const monitor = new MemberMonitor(bot);
            node.send({
              payload: { monitoringData: monitor.textChannelMetric, ...msg },
            });
          });
        })
        .catch((err) => node.error(err));
    } else {
      node.error('Access token not specified');
    }
  });
};

export = nodeInit;
