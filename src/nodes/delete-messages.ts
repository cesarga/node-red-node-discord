import { Node, Red } from 'node-red';
import { Bot } from '../lib/Bot';

import {
  IBot,
  IConnectConfig,
  IDeleteMessageProps,
} from '../lib/interfaces';
import {Message} from 'discord.js';

export = (RED: Red) => {
  RED.nodes.registerType('discord-delete-messages', function(
    this: Node,
    config: IDeleteMessageProps,
  ) {
    RED.nodes.createNode(this, config);
    const node = this;
    const configNode = RED.nodes.getNode(config.token) as IConnectConfig;
    const { token } = configNode;
    if (token) {
      const botInstance = new Bot();
      botInstance
        .get(token)
        .then((bot: IBot) => {
          node.on('input', (msg: Message) => {
            msg.delete()
                .then(() => {
                  node.status({
                    fill: 'green',
                    shape: 'dot',
                    text: 'message deleted',
                  });
                })
                .catch((err: Error) => {
                  node.error("Couldn't delete message:" + err);
                  node.status({
                    fill: 'red',
                    shape: 'dot',
                    text: 'delete error',
                  });
                });
          });
          node.on('close', () => {
            botInstance.destroy(bot);
          });
        })
        .catch((err: Error) => node.error(err));
    } else {
      this.error('Access token not specified');
    }
  });
};
