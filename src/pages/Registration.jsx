import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth_instance } from '../firebase/Firebase_Config';
import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function Registration() {

    const navigate = useNavigate();

    const [user_name, set_user_name] = useState("");
    const [user_email, set_user_email] = useState("");
    const [user_password, set_user_password] = useState("");
    const [user_confirm_password, set_user_confirm_password] = useState("");
    const [show_password, set_show_password] = useState(false);
    const [show_confirm_password, set_show_confirm_password] = useState(false);
    const [ui_message, set_ui_message] = useState("");

    async function register_user(e) {
        e.preventDefault();
        set_ui_message("");

        if (user_password !== user_confirm_password) {
            set_ui_message("Confirm Password Is Not Same As Password!");
            return;
        };

        try {
            let user_credential = await createUserWithEmailAndPassword(auth_instance, user_email, user_password);
            await updateProfile(user_credential.user, { displayName: user_name });
            console.log("User Registered : ", user_credential.user);
            navigate("/uploaded-files");
        }
        catch (error) {
            if (error.code === "auth/email-already-in-use") {
                set_ui_message("Registration Failed! E-Mail Already In Use!");
            };
            console.error("Error During Registration : ", error);
        };
    };

    return (

        <div className="card border-0 shadow-lg col-11 col-sm-8 col-md-5 col-lg-4 p-5 bg-white rounded-4" style={{ animation: "glide_up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards", opacity: 0 }} >

            <h1 className="text-center fw-bold text-dark mb-2 fs-2">Create Account</h1>

            <p className="text-center text-muted small mb-4">Join Our File Sharing App</p>

            <hr className="text-secondary opacity-25 mb-4" />

            {
                ui_message &&
                (
                    <div className={`alert ${ui_message.includes("Sent") ? "alert-success" : "alert-danger"} border-0 shadow-sm small py-2 mb-4 text-center rounded-3`}>
                        {ui_message}
                    </div>
                )
            }

            <Form onSubmit={register_user}>

                <Form.Group className="mb-3" controlId="formBasicName">
                    <Form.Control className="py-2 px-3 bg-light border-0 text-dark rounded-3 shadow-none" type="text" required placeholder="Enter Your Name" value={user_name} onChange={(e) => set_user_name(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Control className="py-2 px-3 bg-light border-0 text-dark rounded-3 shadow-none" type="email" required placeholder="Enter Your E-Mail Address" value={user_email} onChange={(e) => set_user_email(e.target.value)} />
                </Form.Group>

                <div className="mb-3 position-relative">
                    <Form.Control className="py-2 px-3 bg-light border-0 text-dark rounded-3 shadow-none pe-5" type={show_password ? "text" : "password"} placeholder="Enter Your Password" required value={user_password} onChange={(e) => set_user_password(e.target.value)} />
                    <button type="button" className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-decoration-none text-muted small pe-3" onClick={() => set_show_password(!show_password)} tabIndex={-1}>{show_password ? "Hide" : "Show"}</button>
                </div>

                <div className="mb-3 position-relative">
                    <Form.Control className="py-2 px-3 bg-light border-0 text-dark rounded-3 shadow-none pe-5" type={show_confirm_password ? "text" : "password"} placeholder="Confirm Your Password" required value={user_confirm_password} onChange={(e) => set_user_confirm_password(e.target.value)} />
                    <button type="button" className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-decoration-none text-muted small pe-3" onClick={() => set_show_confirm_password(!show_confirm_password)} tabIndex={-1}>{show_confirm_password ? "Hide" : "Show"}</button>
                </div>

                <Button variant="primary" type="submit" className="w-100 py-2 fw-bold text-white border-0 shadow-sm rounded-3" style={{ transition: "transform 0.2s" }} onMouseEnter={(e) => e.target.style.transform = "scale(1.02)"} onMouseLeave={(e) => e.target.style.transform = "scale(1)"} >Register Account</Button>

                <Form.Text className="d-block mt-4 text-center text-muted small">Already Have An Account? <Link to="/login" className="text-primary text-decoration-none fw-bold">Login Here!</Link></Form.Text>

            </Form>

        </div>

    );

};

export default Registration;