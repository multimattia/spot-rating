
    interface ExternalUrls {
      spotify: string;
    }

    interface Image {
      url: string;
      height: number | null;
      width: number | null;
    }

    interface Owner {
      display_name: string;
      external_urls: ExternalUrls;
      href: string;
      id: string;
      type: string;
      uri: string;
    }

    interface Tracks {
      href: string;
      total: number;
    }

    export interface Playlist {
      collaborative: boolean;
      description: string;
      external_urls: ExternalUrls;
      href: string;
      id: string;
      images: Image[];
      name: string;
      owner: Owner;
      primary_color: string | null;
      public: boolean;
      snapshot_id: string;
      tracks: Tracks;
      type: string;
      uri: string;
    }

    export interface PlaylistResponse {
      items: Playlist[];
    }

    export interface PlaylistAdder {
        external_urls: Object;
        followers: Object;
        href: string;
        id: string;
        type: string;
        uri: string;
    }

    export interface ImageObject {
        url: string;
        height: Number;
        width: Number;
    }

    export interface SimplifiedArtistObject {
        external_urls: Object;
        href: string;
        id: string;
        name: string;
        type: string;
        uri: string;
    }

    export interface Album {
        album_type: string;
        id: string;
        name: string;
        images: ImageObject[]
        release_date: string;
        artists: SimplifiedArtistObject[]
    }

    export interface TrackObject {
        album: Album
    }

    export interface OneOf {
        TrackObject: TrackObject;
    }

    export type PlaylistReturnObject = {
        href: string;
        limit: string;
        next: string;
        offset: string;
        previous: string;
        total: string;
        items: PlaylistTrackObject[]
    }

    export type PlaylistTrackObject = {
        track: {

            album: {
              images: {
                height: number;
                url: string;
                width: number;
              }[];
              name: string;
            };
            artists: {
              name: string;
              id: string;
            }[];
            duration_ms: number;
            name: string;
            popularity: number;
          }
          added_by: {
            id: string;
          };
          added_at: string;
    }
