import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET,{
        expiresIn: '15d'
    });
    res.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, //15 days in milliseconds, the maxAge is written in milliseconds
        httpOnly: true, //This means that the cookie cannot be accessed by the client side javascript, this will prevent XSS attacks also known as Cross Site Scripting attacks. Note that this will only work if you are sending the cookie from the server-side, not from the client-side. If you try to set an HTTP-only cookie from the client-side, the browser will ignore the HttpOnly attribute and create a regular cookie instead.
        sameSite: "strict", //This means that the cookie will only be sent in a first-party context and not in a third-party context. This will prevent CSRF attacks also known as Cross Site Request Forgery attacks.
        secure: process.env.NODE_ENV !== "development", //This means that the cookie will only be sent over HTTPS. This should be true in the production environment and false in the development environment.
})
}
