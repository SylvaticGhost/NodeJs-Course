const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied, no token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

async function hashPassword(password) {
    if(!password) throw new Error('Password is required');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (!passwordHash) throw new Error('Invalid password hash generation');
    if (!salt) throw new Error('Invalid salt generation');

    return { passwordHash, salt };
}

async function verifyPassword(inputPassword, user) {
    return !user || await bcrypt.compare(inputPassword, user.passwordHash);
}

function generateJwt(user) {
    return jwt.sign({ username: user.username }, JWT_SECRET, {
        expiresIn: '1h',
    });
}

module.exports = {
    authenticateToken,
    hashPassword,
    verifyPassword,
    generateJwt,
};
