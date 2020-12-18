<template>
  <div id="admin-dashboard">
    <b-sidebar
      position="static"
      mobile="reduce"
      type="is-light"
      fullheight
      open
    >
      <div id="padded-content">
        <b-menu class="is-custom-mobile">
          <b-menu-list label="Content">
            <b-menu-item icon="text-box" label="Articles" v-model="section_articles"></b-menu-item>
            <b-menu-item icon="pencil" label="Drafts" v-model="section_drafts"></b-menu-item>
            <b-menu-item icon="archive" label="Archives" v-model="section_archives"></b-menu-item>
            <b-menu-item icon="delete" label="Trash" v-model="section_trash"></b-menu-item>
          </b-menu-list>
          <b-menu-list label="Actions">
            <li>
              <a @click.prevent="logout">
                <b-icon icon="logout" size="is-small"></b-icon>
                <span class="pl-1">Logout</span>
              </a>
            </li>
          </b-menu-list>
        </b-menu>
      </div>
    </b-sidebar>
  
    <ArticlesTable v-if="section_articles" />
    <DraftsTable v-if="section_drafts" />
    <ArchivesTable v-if="section_archives" />
    <TrashTable v-if="section_trash" />
  </div>
</template>

<script>
export default {
  layout: 'admin',
  data() {
    return {
      section_articles: true,
      section_drafts: false,
      section_archives: false,
      section_trash: false,
    };
  },
  methods: {
    async logout() {
      await this.$axios
        .$get('/api/admin/logout')
        .catch((e) => console.log(e.stack));
      this.$router.push('/');
    }
  },
};
</script>

<style scoped lang="scss">
@import "~bulma/sass/utilities/initial-variables";

#admin-dashboard {
  display: flex;
  height: calc(100vh - 68px);
  overflow: hidden;
}

#dashboard-content {
  overflow-y: auto;
}

#padded-content {
  padding: 0.75rem;
}

.b-sidebar {
  display: flex;
  flex-direction: row;
  min-height: 100%;
  text-align: left;
  margin-right: 24px;
  z-index: 0;
}

#dashboard-content {
  flex-grow: 1;
}

/deep/ {
  th {
    vertical-align: bottom;
  }

  tbody td {
    vertical-align: middle;
  }
}

@media screen and (min-width: $desktop) {
  #dashboard-content {
    overflow-x: hidden;
  }
}

@media screen and (max-width: $tablet) {
  #padded-content {
    padding: 0.25rem;
  }

  .b-sidebar {
    margin-right: 12px;
  }
}
</style>