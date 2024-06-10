async function getPosts() {
  const res = await fetch("/getposts");
  const data = await res.json();
  return data;
}

function hyphenate(str) {
  return str.replace(/ +/g, "-");
}

getPosts().then((posts) => {
  const postsContainer = document.querySelector("#posts");

  if ("content" in document.createElement("template")) {
    const template = document.querySelector("#post-template");

    console.log(posts);

    posts.forEach((post) => {
      const clone = template.content.cloneNode(true);
      let title = clone.querySelector(".post-item-title");
      title.textContent = post;
      title.href = `/posts/${hyphenate(post.toLowerCase())}`;

      postsContainer.appendChild(clone);
    });
  } else {
    console.log("templates are not supported");
  }
});
