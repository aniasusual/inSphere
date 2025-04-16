interface Toast {
    id: number;
    message: string;
    type: "join" | "leave";
}

export const Toast: React.FC<{ message: string; type: "join" | "leave" }> = ({
    message,
    type,
}) => {
    return (
        <div className={`toast ${type}`}>
            <span className="material-icons">
                {type === "join" ? "person_add" : "person_remove"}
            </span>
            {message}
        </div>
    );
};