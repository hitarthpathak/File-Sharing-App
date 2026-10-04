import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth_instance } from '../firebase/Firebase_Config';
import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function Login() {

    const navigate = useNavigate();

    const [user_email, set_user_email] = useState("");
    const [user_password, set_user_password] = useState("");
    const [is_forgot_password, set_is_forgot_password] = useState(false);
    const [show_password, set_show_password] = useState(false);
    const [ui_message, set_ui_message] = useState("");
    const [is_loading, set_is_loading] = useState(false);

    async function login_user(e) {
        e.preventDefault();
        set_ui_message("");

        try {
            let user_credential = await signInWithEmailAndPassword(auth_instance, user_email, user_password);
            console.log("User Logged In : ", user_credential.user);
            navigate("/uploaded-files");
        }
        catch (error) {
            if (error.code === "auth/user-not-found") {
                set_ui_message("Login Failed! User Not Found!");
            };
            if (error.code === "auth/wrong-password") {
                set_ui_message("Login Failed! Wrong Password!");
            };
            console.error("Error During Login : ", error);
        };
    };

    async function reset_password(e) {
        e.preventDefault();
        set_ui_message("");
        set_is_loading(true);

        try {
            await sendPasswordResetEmail(auth_instance, user_email.trim());
            set_ui_message("Password Reset Link Sent! Check Your E-Mail (Or The Emulator Terminal)!");
        }
        catch (error) {
            set_ui_message("Error During Password Reset!");
            console.error("Error During Password Reset:", error);
        }
        finally {
            set_is_loading(false);
        };
    };

    return (

        <div className="card border-0 shadow-lg col-11 col-sm-8 col-md-5 col-lg-4 p-5 bg-white rounded-4" style={{ animation: "glide_up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards", opacity: 0 }}>

            <h1 className="text-center fw-bold text-dark mb-2 fs-2">File Sharing App</h1>

            <p className="text-center text-muted small mb-4">Secure File Storage Portal</p>

            <hr className="text-secondary opacity-25 mb-4" />

            {
                ui_message &&
                (
                    <div className={`alert ${ui_message.includes("Sent") ? "alert-success" : "alert-danger"} border-0 shadow-sm small py-2 mb-4 text-center rounded-3`}>
                        {ui_message}
                    </div>
                )
            }

            {
                !is_forgot_password ?
                    (
                        <Form onSubmit={login_user}>

                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Control className="py-2 px-3 bg-light border-0 text-dark rounded-3 shadow-none" type="email" placeholder="Enter Your E-Mail Address" required value={user_email} onChange={(e) => set_user_email(e.target.value)} />
                            </Form.Group>

                            <Form.Group className="mb-2" controlId="formBasicPassword">
                                <div className="position-relative">
                                    <Form.Control className="py-2 px-3 bg-light border-0 text-dark rounded-3 shadow-none pe-5" type={show_password ? "text" : "password"} placeholder="Enter Your Password" required value={user_password} onChange={(e) => set_user_password(e.target.value)} />
                                    <button type="button" className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-decoration-none text-muted small pe-3" onClick={() => set_show_password(!show_password)} tabIndex={-1}>{show_password ? "Hide" : "Show"}</button>
                                </div>
                            </Form.Group>

                            <div className="text-end mb-3">
                                <button type="button" className="btn btn-link btn-sm text-decoration-none p-0" onClick={() => { set_is_forgot_password(true); set_ui_message(""); }}>Forgot Password?</button>
                            </div>

                            <Button variant="primary" type="submit" className="w-100 py-2 fw-bold text-white border-0 shadow-sm rounded-3" style={{ transition: "transform 0.2s" }} onMouseEnter={(e) => e.target.style.transform = "scale(1.02)"} onMouseLeave={(e) => e.target.style.transform = "scale(1)"}>Login To Account</Button>

                            <Form.Text className="d-block mt-4 text-center text-muted small"> Don't Have An Account, <Link to="/registration" className="text-primary text-decoration-none fw-bold">Register Yourself!</Link> </Form.Text>

                        </Form>
                    )

                    :

                    (
                        <Form onSubmit={reset_password}>

                            <p className="text-muted small mb-3 text-center">Enter Your E-Mail And We’ll Send You A Password Reset Link.</p>

                            <Form.Group className="mb-3" controlId="formResetEmail">
                                <Form.Control className="py-2 px-3 bg-light border-0 text-dark rounded-3 shadow-none" type="email" placeholder="Enter Your E-Mail Address" required value={user_email} onChange={(e) => set_user_email(e.target.value)} />
                            </Form.Group>

                            <Button variant="primary" type="submit" className="w-100 py-2 fw-bold text-white border-0 shadow-sm rounded-3" disabled={is_loading} >{is_loading ? "Sending..." : "Send Reset Link"}</Button>

                            <div className="text-center mt-3">
                                <button type="button" className="btn btn-link btn-sm text-decoration-none" onClick={() => { set_is_forgot_password(false); set_ui_message(""); }} >← Back to Login</button>
                            </div>

                        </Form>
                    )
            }

        </div>

    );

};

export default Login;