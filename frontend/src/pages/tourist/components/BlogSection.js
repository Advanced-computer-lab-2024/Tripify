import React from "react";
import image1 from "../assets/images/image_1.jpg";
import image2 from "../assets/images/image_2.jpg";
import image3 from "../assets/images/image_3.jpg";

const BlogSection = () => {
  const blogs = [
    {
      id: 1,
      image: image1,
      day: "11",
      year: "2020",
      month: "September",
      title: "Most Popular Place In This World",
      link: "#",
    },
    {
      id: 2,
      image: image2,
      day: "11",
      year: "2020",
      month: "September",
      title: "Most Popular Place In This World",
      link: "#",
    },
    {
      id: 3,
      image: image3,
      day: "11",
      year: "2020",
      month: "September",
      title: "Most Popular Place In This World",
      link: "#",
    },
  ];

  return (
    <section className="ftco-section">
      <div className="container">
        <div className="row justify-content-center pb-4">
          <div className="col-md-12 heading-section text-center ftco-animate">
            <span className="subheading">Our Blog</span>
            <h2 className="mb-4">Recent Post</h2>
          </div>
        </div>
        <div className="row d-flex">
          {blogs.map((blog) => (
            <div className="col-md-4 d-flex ftco-animate" key={blog.id}>
              <div className="blog-entry justify-content-end">
                <a href="blog-single.html" className="block-20" style={{ backgroundImage: `url(${blog.image})` }}>
                </a>
                <div className="text">
                  <div className="d-flex align-items-center mb-4 topp">
                    <div className="one">
                      <span className="day">{blog.day}</span>
                    </div>
                    <div className="two">
                      <span className="yr">{blog.year}</span>
                      <span className="mos">{blog.month}</span>
                    </div>
                  </div>
                  <h3 className="heading">
                    <a href={blog.link}>{blog.title}</a>
                  </h3>
                  <p>
                    <a href={blog.link} className="btn btn-primary">
                      Read more
                    </a>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
