import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        // Support both Authorization header (cross-origin) and cookie (same-origin)
        let token = req.cookies.token;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        if(!token){
            return res.status(401).json({
                message:"User not authenticated",
                success:false,
            })
        }

        const decode = jwt.verify(token, process.env.SECRET_KEY);

        if(!decode){
            return res.status(401).json({
                message:"Invalid Token",
                success:false,
            })
        }

        req.id = decode.userId;

        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Invalid or expired token", success: false });
    }
}

export default isAuthenticated;