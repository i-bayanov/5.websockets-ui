type WsMessageType =
  | 'reg'
  | 'create_room'
  | 'add_user_to_room'
  | 'add_ships'
  | 'attack'
  | 'randomAttack'
  | 'single_play'
  | 'update_winners';

interface WsMessage {
  type: WsMessageType;
  data: string;
}

const enum ErrorMessages {
  LogOrPassIncorrect = 'Incorrect login or password',
  LogOrPassTooShort = 'Login or password are too short, min 5 characters',
  ReauthorizationError = 'You are already signed in on another window or device',
}

interface ErrorMsg {
  error: true;
  errorText: `${ErrorMessages}`;
}

interface AuthenticatedUser {
  name: string;
  index: number;
}
