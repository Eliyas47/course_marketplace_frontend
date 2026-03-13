import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Online Course Marketplace</h1>
      <Link to="/courses">Browse Courses</Link>
    </div>
  );
}

export default Home;