const {hashPassword, verifyPassword, generateJwt} = require("./authService");
const {userExists, createUser, getUser} = require("../repositories/userRepository");
const {Contracts} = require("../contracts");

async function registerUser(createUserDto) {
    Contracts.UserCreate.implement(createUserDto);
    if (await userExists(createUserDto.username))
        return {code: 400, message: 'User already exists'};

    const {passwordHash, salt} = await hashPassword(createUserDto.password);

    const user = await createUser(createUserDto.username, passwordHash, salt);

    return {
        code: user ? 201 : 500,
        message: user ? '' : 'Internal server error',
        value: {username: user.username}
    };
}

async function loginUser(userLoginDto) {
    Contracts.UserLogin.implement(userLoginDto);

    const user = await getUser(userLoginDto.username);

    if (!user || !await verifyPassword(userLoginDto.password, user))
        return {code: 401, message: 'Invalid credentials'};

    const jwt = generateJwt(user);

    return {
        code: 200, value: {token: jwt}
    }
}

module.exports = {
    registerUser,
    loginUser,
};
