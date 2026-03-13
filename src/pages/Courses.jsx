import { useEffect, useState } from "react";
import API from "../api/api";

function Courses() {

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    API.get("courses/")
      .then(res => {
        setCourses(res.data.results || res.data);
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <h1>All Courses</h1>

      {courses.map(course => (
        <div key={course.id}>
          <h3>{course.title}</h3>
          <p>{course.description}</p>
        </div>
      ))}

    </div>
  );
}

export default Courses;