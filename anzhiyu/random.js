var posts=["2025/01/20/欢迎来到亚里士AI说/","2025/01/21/向上/","2025/01/20/监督学习模型/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };