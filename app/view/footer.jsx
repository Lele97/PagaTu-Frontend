import React from "react";
import {Link} from "react-router-dom";
import styles from "~/styles/footer.module.css";

const Footer = () => {
    return (
        <footer>
            <div>
                <div>
                    <img src="/webstorm-svgrepo-com.svg" alt="WebStorm Logo Logo"/>
                </div>
                <div>
                    <Link
                        to="/leaderboard">
                        Classifica Completa
                    </Link>
                    <p>PagaTu - Il caffè che unisce il team</p>
                    <p>© {new Date().getFullYear()} PagaTu. All rights reserved.</p>
                    <p>Built with <i className={styles.heart}></i>| using React & Express</p>
                    <div>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Contact Us</a>
                    </div>
                </div>
                <div>
                    <img src="/react-16-svgrepo-com.svg" alt="React Logo"/>
                </div>
            </div>
        </footer>
    );
};


/*
* <footer>
  <div class="container-fluid text-light py-4 mt-auto d-flex justify-content-between align-items-center">

    <!-- Left Image -->
    <div class="col-md-4">
      <img src="/image/node-js-svgrepo-com.svg" alt="Node.js Logo" style="width: 50px; height: auto;" />
    </div>

    <!-- Center Content -->
    <div class="text-center flex-grow-1 col-md-4">
      <p class="mb-1">&copy; 2025 Your Company Name. All rights reserved.</p>
      <p class="small">
        Built with
        <i class="bi bi-suit-heart-fill text-danger"></i>
        using Node.js &amp; Pug
      </p>
      <div>
        <a class="text-light mx-3" href="#">Privacy Policy</a>
        <a class="text-light mx-3" href="#">Terms of Service</a>
        <a class="text-light mx-3" href="#">Contact Us</a>
      </div>
    </div>

    <!-- Right Image -->
    <div class="col-md-4">
      <img src="/image/webstorm-svgrepo-com.svg" alt="WebStorm Logo" style="width: 50px; height: auto;" />
    </div>

  </div>
</footer>*/


export default Footer;
