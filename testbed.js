const createDOMPurify = require("dompurify");
const createDOMPurify2_0 = require("dom2.0");
const createDOMPurify2_1 = require("dom2.1");
const createDOMPurify2_2 = require("dom2.2");
const { JSDOM } = require('jsdom');
const cookieParser = require('cookie-parser')

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);
const DOMPurify2_0 = createDOMPurify2_0(window);
const DOMPurify2_1 = createDOMPurify2_1(window);
const DOMPurify2_2 = createDOMPurify2_2(window);

const express = require("express");
const multer = require("multer");
const app = express();

// Set up Multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

function escape(htmlStr) {
  return htmlStr.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");        

}

app.use(cookieParser());

app.use(function (req, res, next) {
  res.cookie('Seceret Cookie','Do Not Expose This Cookie');
  next(); 
});

app.use(express.static("testbed"));


app.post("/upload", upload.single("svg"), (req, res) => {
  console.clear;
  console.log(req.body);
  let cleanSvg = '';
  let useDompurify;
  if(req.file){
    switch (req.body['version']){

      case 'none':
        useDompurify = '';
        break;

      case 'latest':
        useDompurify = DOMPurify;
        break;

      case '2.0.0':
        useDompurify = DOMPurify2_0; 
        break;

      case '2.1.0':
        useDompurify = DOMPurify2_1;
        break;

      case '2.2.0':
        useDompurify = DOMPurify2_2;
        break;
    }

    if(useDompurify==''){
      cleanSvg = req.file.buffer.toString();
    }else{      
      cleanSvg = useDompurify.sanitize(req.file.buffer.toString());
    }
    console.log(useDompurify);
    res.send(`<html>  
    <head>
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.3/jquery.min.js"></script>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" >
      <title>Upload SVG</title>
    </head>
    <body>
        <header class="bg-dark text-white py-3">
            <div class="container">
                <div class="row">
                    <div class="col-12 col-md-6">
                        <h1>SVG Image Injection Testbed</h1>
                    </div>
                    <div class="col-12 col-md-6">
                        <nav class="navbar navbar-expand-lg navbar-dark bg-dark justify-content-end">
                            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                                <span class="navbar-toggler-icon"></span>
                            </button>
                            <div class="collapse navbar-collapse" id="navbarNav">
                                <ul class="navbar-nav">
                                    <li class="nav-item">
                                        <a class="nav-link" href="/index.html">Home</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" href="#">About</a>
                                    </li>
                                </ul>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
        </header>
        <div class="container my-5">
            <div class="row">
                <div class="col-12 my-5 "> 
                    <h1>DOMpurify Version</h1>
                    <p>${req.body['version']}</p>
                                       
                <br><button class='btn btn-secondary' onclick="location.href = 'index.html';">Back</button>
                </div>
                <div class="my-5">
                <div class="col-6"> 
                  <h1>Uploaded SVG</h1>
                  ${cleanSvg} 
                  
                  </div>
                  <div class="col-6"> 
                  <h1>Uploaded SVG XML</h1>
                  ${escape(cleanSvg)} 
                  
                  </div>
                </div>
            </div>
        </div>
          </body>
        </html>
      `);
  }
  else if(req.body['Back']){
    res.redirect('/');
  }
  else{
    res.redirect('/error.html');
    
  }
  
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
