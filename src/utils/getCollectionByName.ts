import {getCollection, type CollectionKey} from "astro:content";

export const getCollectionByName = async <T extends CollectionKey>(name: T) => {
  let posts = await getCollection(name);
  if (posts && posts.length > 0) {
    return posts.filter(({data}: any) => {
      return !data.draft
    });
  } else {
    return []
  }
}
