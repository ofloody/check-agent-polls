import { useState } from "react";
import { PollDashboard } from "./components/PollDashboard";
import { QuestionSetBuilder } from "./components/QuestionSetBuilder";
import "./index.css";

type Page = "dashboard" | "builder";

export function App() {
  const [page, setPage] = useState<Page>("dashboard");

  return (
    <div className="container mx-auto p-8">
      {page === "dashboard" ? (
        <PollDashboard onNavigate={(p) => setPage(p as Page)} />
      ) : (
        <QuestionSetBuilder onNavigate={() => setPage("dashboard")} />
      )}
    </div>
  );
}

export default App;
