<template>
  <div class="field is-horizontal">
    <div class="field-label is-normal">
      <label class="label">Image</label>
    </div>
    <div class="field-body">
      <div class="field">
        <p id="control-area" class="control has-icons-right">
          <input readonly class="input" :value="value" @click="open_modal" />

          <span @click="$emit('input', null)">
            <font-awesome-icon
              size="xs"
              :icon="['fas', 'times-circle']"
              class="icon is-right"
              style="font-size: 0.6em; top: 20%; right: 8px"
            />
          </span>
        </p>
      </div>
    </div>

    <b-modal v-model="showModal" :width="464">
      <div class="card">
        <nav class="panel">
          <div class="panel-heading">
            <p>Select an image</p>
            <div id="panel-heading-upload" class="field">
              <div class="file is-success">
                <label class="file-label">
                  <input @change="upload_file" class="file-input" type="file" />
                  <span class="file-cta">
                    <font-awesome-icon
                      size="sm"
                      :icon="['fas', 'upload']"
                      class="file-icon icon is-left"
                    />
                    <span class="file-label"> Choose a file… </span>
                  </span>
                </label>
              </div>
            </div>
          </div>
          <div class="panel-block">
            <p class="control has-icons-left">
              <input class="input" type="text" placeholder="Search" />
              <font-awesome-icon
                size="xs"
                :icon="['fas', 'search']"
                class="icon is-left"
                style="font-size: 0.4em; top: 30%; left: 16px"
              />
            </p>
          </div>
          <div id="image-grid" class="columns is-multiline is-1">
            <div
              v-for="file in files[page - 1]"
              :key="file.url"
              class="column is-half-mobile is-half-tablet is-one-third-desktop"
            >
              <p @click="select(file)" class="image is-square">
                <img :src="file.url" :alt="file.alt" />
              </p>
            </div>
          </div>
          <div id="page-control">
            <b-button @click="set_page(page - 1)" v-show="page > 1">
              <font-awesome-icon
                size="1x"
                :icon="['fas', 'arrow-left']"
                class="icon"
                style="margin-top: 5px"
              />
            </b-button>
            <p>Page {{ page }}</p>
            <b-button
              @click="set_page(page + 1)"
              v-show="page + 1 <= files.length || next_page_token != null"
            >
              <font-awesome-icon
                size="1x"
                :icon="['fas', 'arrow-right']"
                class="icon"
                style="margin-top: 5px"
              />
            </b-button>
          </div>
        </nav>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: "ArticleMetaInput",
  props: {
    value: String,
  },
  data() {
    return {
      showModal: false,
      page: 1,
      files: [],
      next_page_token: "",
    };
  },
  methods: {
    async open_modal() {
      this.showModal = true;
      await this.set_page(1);
    },
    async set_page(page) {
      if (page < 1) return;
      this.page = page;
      const real_page = page - 1;
      if (this.files.length <= real_page) {
        const query =
          this.next_page_token == ""
            ? ""
            : `?page_token=${this.next_page_token}`;
        this.next_page_token = null;
        await this.$axios
          .$get(`/api/admin/storage${query}`)
          .then((res) => {
            this.files.push(
              res.files.map((file) => {
                return { url: file.url.replace(/^static\//gi, "/static_files/"), alt: file.alt } 
              })
            );
            this.next_page_token = res.next_page_query?.pageToken;
          })
          .catch((e) => console.log(e.stack));
      }
    },
    select(file) {
      this.$emit("input", file.url);
      this.showModal = false;
    },
    async upload_file(e) {
      console.log(e.target.files);
      var form_data = new FormData();
      form_data.append("file", e.target.files[0]);
      await this.$buefy.dialog.prompt({
        message: "Enter alt (optional)",
        inputAttrs: {
          placeholder: "e.g. Photo of a dog",
        },
        trapFocus: true,
        onConfirm: (value) => form_data.append("alt", value),
      });

      await this.$axios
        .$post(`/api/admin/storage`, form_data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          const url = res.url.replace(/^static\//gi, "/static_files/");
          this.$emit("input", url);
          this.showModal = false;
          this.page = 1;
          this.files = [];
          this.next_page_token = "";
        })
        .catch((e) => console.log(e.stack));
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~bulma/sass/utilities/initial-variables";

.panel-heading {
  display: flex;
  align-items: center;

  p {
    display: inline;
  }

  #panel-heading-upload {
    margin-left: auto;
    order: 2;
    font-size: medium;
  }
}

#image-grid {
  padding: 8px;
  margin-bottom: 0;

  .image {
    overflow: hidden;
    cursor: pointer;

    img {
      height: unset;
      width: unset;
    }
  }
}

#page-control {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 16px;

  p {
    margin: 0 8px;
  }
}

#control-area {
  display: flex;
  padding-right: 8px;

  span {
    display: inline-block;
    width: 2em;
    height: 2em;
  }
}

@media screen and (max-width: $desktop) {
  #drop-text {
    font-size: 23px;
  }
}
</style>