import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const [user] = useState(JSON.parse(localStorage.getItem("user")));
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [status, setStatus] = useState({ message: "", error: false });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setStatus({ message: "Password baru tidak cocok", error: true });
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(
                "http://localhost:5000/api/change-password",
                {
                    email: user.email,
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );

            setStatus({ message: "Password berhasil diubah", error: false });
            setShowChangePassword(false);
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            setStatus({ message: error.response?.data?.error || "Terjadi kesalahan", error: true });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <h2>Dashboard</h2>
            <p>Selamat datang, {user.name}!</p>

            <button onClick={() => setShowChangePassword(!showChangePassword)} className="secondary-button">
                Ubah Password
            </button>
            <button onClick={handleLogout} className="danger-button">
                Logout
            </button>

            {showChangePassword && (
                <form onSubmit={handleChangePassword} className="password-form">
                    <h3>Ubah Password</h3>
                    <div className="form-group">
                        <input type="password" placeholder="Password Saat Ini" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <input type="password" placeholder="Password Baru" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <input type="password" placeholder="Konfirmasi Password Baru" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                    </div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <div className="loading-spinner">
                                <div className="spinner"></div>
                                <span>Menyimpan...</span>
                            </div>
                        ) : (
                            "Simpan Password Baru"
                        )}
                    </button>
                    {status.message && <div className={status.error ? "error-message" : "success-message"}>{status.message}</div>}
                </form>
            )}
        </div>
    );
}

export default Dashboard;
