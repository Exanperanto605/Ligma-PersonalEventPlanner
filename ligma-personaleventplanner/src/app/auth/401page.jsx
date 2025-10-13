export default function UnauthorizedPage() {
    return (
        <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        color: "#fff",
        textAlign: "center"
        }}>
        <h1 style={{ fontSize: "3rem" }}>401</h1>
        <p>You are not authorized to view this page.</p>
        <a href="/" style={{
            marginTop: "1rem",
            color: "#6366f1",
            textDecoration: "underline"
        }}>
            Go back home
        </a>
        </div>
    );
}