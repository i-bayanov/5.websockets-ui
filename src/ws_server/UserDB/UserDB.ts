import { createHash } from 'crypto';

interface Users {
  [name: string]: {
    passwordHash: string;
    index: number;
  };
}

class UsersDB {
  private users: Users = {};
  private nextUserIndex = 0;

  public reg({ name, password }: User): ErrorMsg | AuthenticatedUser {
    const isNameInvalid = typeof name !== 'string' || name.length < 5;
    const isPasswordInvalid = typeof password !== 'string' || password.length < 5;
    if (isNameInvalid || isPasswordInvalid)
      return { error: true, errorText: ErrorMessages.LogOrPassTooShort };

    const passwordHash = createHash('sha256').update(password).digest('hex');

    if (name in this.users) {
      const registeredUser = this.users[name];

      if (passwordHash !== registeredUser.passwordHash)
        return { error: true, errorText: ErrorMessages.LogOrPassIncorrect };
    } else {
      this.users[name] = { passwordHash, index: this.nextUserIndex };
      this.nextUserIndex++;
    }

    return { name, index: this.users[name].index };
  }
}

export const usersDB = new UsersDB();
