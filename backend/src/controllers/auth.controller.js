export async function signup(req, res) {
    console.log("GET /api/auth/signup route hit");
    res.send("Signup Route");
}

export async function login(req, res) {
    console.log("GET /api/auth/login route hit");
    res.send("Login Route");
}

export async function logout(req, res) {
    console.log("GET /api/auth/logout route hit");
    res.send("Logout Route");
}
export default { signup, login, logout };