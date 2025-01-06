const cookieJwtAuth = (req, res, next) => {
    const token = req.cookies.token; // Assuming the cookie is named 'token'
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        console.log("Przechodzenie przez autoryzacje ")
        next(); // Pass control to the next middleware
    } catch (error) {
        return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
};

module.exports = cookieJwtAuth;