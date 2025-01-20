var posts=["2025/01/20/hello-world/","2025/01/20/欢迎来到亚里士AI说/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };