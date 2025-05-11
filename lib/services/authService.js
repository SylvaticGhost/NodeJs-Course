const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const JWT_SECRET = process.env.JWT_SECRET || "default-secret";

const authenticateToken = (req, res, next) => {
    const token =
        req.cookies.auth_token ||
        req.cookies.auth_token ||
        (req.headers["authorization"] && req.headers["authorization"].split(" ")[1]);

    if (!token) {
        if (req.xhr || req.path.startsWith("/api/")) {
            return res.status(401).json({ error: "Access denied, no token provided" });
        }
        // For browser requests, redirect to login page
        return res.redirect("/login");
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            if (req.xhr || req.path.startsWith("/api/")) {
                return res.status(403).json({ error: "Invalid or expired token" });
            }
            return res.redirect("/login?redirectTo=" + encodeURIComponent(req.originalUrl));
        }
        req.user = user;
        next();
    });
};

const verifyToken = (token) =>
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return false;
        }
        const currentTime = Math.floor(Date.now() / 1000);
        console.log(`exp=${user.exp}, currentTime=${currentTime}`);
        if (user.exp && user.exp < currentTime) {
            return false;
        }

        return true;
    });

async function hashPassword(password) {
    if (!password) throw new Error("Password is required");

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (!passwordHash) throw new Error("Invalid password hash generation");
    if (!salt) throw new Error("Invalid salt generation");

    return { passwordHash, salt };
}

async function verifyPassword(inputPassword, user) {
    return !user || (await bcrypt.compare(inputPassword, user.passwordHash));
}

function generateJwt(user) {
    return jwt.sign({ username: user.username }, JWT_SECRET, {
        expiresIn: "1h",
    });
}

/**
 * Optional authentication middleware
 * If a valid token is present, adds the user to req.user
 * but does not block the request if no token is present
 */
const optionalAuthenticate = (req, res, next) => {
    const token =
        req.cookies.auth_token ||
        req.cookies.token ||
        (req.headers["authorization"] && req.headers["authorization"].split(" ")[1]);

    if (!token) {
        // Continue without authentication
        next();
        return;
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (!err) {
            // If valid token, add user to request
            req.user = user;
        }
        // Continue regardless of token validity
        next();
    });
};

module.exports = {
    authenticateToken,
    hashPassword,
    verifyPassword,
    generateJwt,
    verifyToken,
    optionalAuthenticate // Add the new middleware to exports
};
