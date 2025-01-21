var posts=["2025/01/20/hello-world/","2025/01/20/欢迎来到亚里士AI说/","2025/01/21/向上/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };