import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [status] = useState({
    loading: false,
    message: "当前后端未开放找回密码接口，请联系面试官重置密码。"
  });

  return (
    <section className="form-card">
      <h1>Reset Password</h1>
      {status.message && <p className="hint">{status.message}</p>}
      <div className="form-footer">
        <Link to="/login">Back to login</Link>
      </div>
    </section>
  );
}
