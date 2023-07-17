import { RawData, WebSocket } from 'ws';
import { parseAndHandleMessage } from './parseAndHandleMessage';

export function webSocketMessageHandler(this: WebSocket, rawData: RawData) {
  try {
    const message = JSON.parse(rawData.toString()) as WsMessage;
    console.log('Message:\n', message);

    parseAndHandleMessage(this, message);
  } catch (error) {
    if (error instanceof Error) {
      this.send(
        JSON.stringify({
          type: 'error',
          data: JSON.stringify({ error: true, errorText: error.message }),
        })
      );
      console.error(error.message);
    }
  }
}
