<template>
  <div class="article">
    <section class="section">
      <div class="container">
        <div class="columns">
          <div class="column"></div>
          <div class="column is-two-fifths">
            <p class="title">{{ title }}</p>
            <p class="title">{{ test }}</p>
            <p class="subtitle mb-2">by {{ author }}</p>
            <i>{{ description }}</i>
          </div>
          <div class="column"></div>
        </div>
        <div class="columns">
          <div class="column has-text-left" id="contents">
            <strong>Contents:</strong>
            <ol>
              <li><a>Sonata vs. sonata form</a></li>
              <li><a>History of the sonata</a></li>
              <li><a>Suggestions</a></li>
            </ol>
          </div>
          <div class="column is-three-quarters has-text-left">
            <div class="content" v-html="content"></div>

            <div class="columns" id="media-tags">
              <div class="column is-one-third">
                <div class="box">
                  <strong class="title is-5">Share:</strong>
                  <br />
                  <span class="icon has-text-info mt-3 ml-2 mr-3">
                    <i class="fab fa-twitter-square fa-3x"></i>
                  </span>
                  <span class="icon has-text-info mt-3 ml-5 mr-3">
                    <i class="fab fa-facebook-square fa-3x"></i>
                  </span>
                  <span class="icon has-text-info mt-3 ml-5">
                    <i class="fab fa-reddit-square fa-3x"></i>
                  </span>
                </div>
              </div>

              <div class="column">
                <div class="box">
                  <div class="field is-grouped is-grouped-multiline">
                    <label class="label">Category:</label>
                    <div class="control">
                      <div class="tags has-addons">
                        <a class="tag is-link">Article</a>
                      </div>
                    </div>
                  </div>
                  <div class="field is-grouped is-grouped-multiline">
                    <label class="label">Tags:</label>
                    <div class="control">
                      <div class="tags has-addons">
                        <a class="tag is-light">Sonata</a>
                      </div>
                    </div>
                    <div class="control">
                      <div class="tags has-addons">
                        <a class="tag is-light">Classical</a>
                      </div>
                    </div>
                    <div class="control">
                      <div class="tags has-addons">
                        <a class="tag is-light">Romantic</a>
                      </div>
                    </div>
                    <div class="control">
                      <div class="tags has-addons">
                        <a class="tag is-light">Modern</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="column"></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Home',
  data() {
    return {
      title: "What is a Sonata?",
      test: "",
      author: "Henry Sloan",
      description: "Many of the most popular classical works are \"Sonatas\". Let's look at what that means, and how we can navigate this vast genre.",
      content: "<p>&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp;Hello, world! Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p><p>&nbsp;&nbsp;&nbsp;&nbspOne morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.</p><p>&nbsp;&nbsp;&nbsp;&nbspHe lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</p><p>&nbsp;&nbsp;&nbsp;&nbspThe bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked.</p><p>&nbsp;&nbsp;&nbsp;&nbsp'What's happened to me? ' he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.</p><p>&nbsp;&nbsp;&nbsp;&nbspA collection of textile samples lay spread out on the table - Samsa was a travelling salesman - and above it there hung a picture that he had recently cut out of an illustrated magazine and housed in a nice, gilded frame.</p><p>&nbsp;&nbsp;&nbsp;&nbspIt showed a lady fitted out with a fur hat and fur boa who sat upright, raising a heavy fur muff that covered the whole of her lower arm towards the viewer. Gregor then turned to look out the window at the dull weather.</p><p>&nbsp;&nbsp;&nbsp;&nbspDrops of rain could be heard hitting the pane, which made him feel quite sad.</p><p>&nbsp;&nbsp;&nbsp;&nbsp'How about if I sleep a little bit longer and forget all this nonsense', he thought, but that was something he was unable to do because he was used to sleeping on his right, and in his present state couldn't get into that position.</p><p>&nbsp;&nbsp;&nbsp;&nbspHowever hard he threw himself onto his right, he always rolled back to where he was.</p><p>&nbsp;&nbsp;&nbsp;&nbspHe must have tried it a hundred times, shut his eyes so that he wouldn't have to look at the floundering legs, and only stopped when he began to feel a mild, dull pain there that he had never felt before. 'Oh, God', he thought, 'what a strenuous career it is that I've chosen!</p><p>&nbsp;&nbsp;&nbsp;&nbspTravelling day in and day out.</p><p>&nbsp;&nbsp;&nbsp;&nbspDoing business like this takes much more effort than doing your own business at home, and on top of that there's the curse of travelling, worries about making train connections, bad and irregular food, contact with different people all the time so that you can never get to know anyone or become friendly with them. It can all go to Hell!</p><p>&nbsp;&nbsp;&nbsp;&nbsp' He felt a slight itch up on his belly; pushed himself slowly up on his back towards the headboard so that he could lift his head better; found where the itch was, and saw that it was covered with lots of little white spots which he didn't know what to make of; and when he tried to feel the place with one of his legs he drew it quickly back because as soon as he touched it he was overcome by a cold shudder. He slid back into his former position. 'Getting up early all the time', he thought, 'it makes you stupid. You've got</p>"
    }
  },
  created() {
    this.fetchTest();
  },
  watch: {
    '$route': 'fetchTest'
  },
  methods: {
    fetchTest: function() {
      const API_URL = '/api';
      let uri = `${API_URL}`;
      axios.get(uri).then(response => {
        this.test = response.data;
      });
    }
  }
}
</script>

<style scoped lang="scss">
@import "~bulma/sass/utilities/_all";

#title-area {
  display: flex;
  justify-content: center;
}

.label {
  padding-right: 8px;
}

#contents {
  a {
      text-decoration: none;
      display: block;
      width: 100%;
      height: 100%;
  }
}

#media-tags {
  .column {
    display: flex;
    align-items: stretch;
    flex-flow: column;
  }

  .box {
    height: 100%;
    vertical-align: middle;
  }
}

@media screen and (max-width: $tablet) {
  .column:empty {
    display: none;
  }

  #contents ol {
    padding-left: 16px;
  }
}
</style>