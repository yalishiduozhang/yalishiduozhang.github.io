var posts=["2025/01/21/向上/","2025/01/20/欢迎来到亚里士AI说/","2025/01/20/监督学习模型/","2025/02/09/CS224W解题/","2025/02/09/图/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };