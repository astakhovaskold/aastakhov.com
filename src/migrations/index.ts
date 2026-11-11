import * as migration_20260800_000000_locales_schema from './20260800_000000_locales_schema';
import * as migration_20260826_113000_post_category_directory from './20260826_113000_post_category_directory';
import * as migration_20260826_120000_eyebrow_content from './20260826_120000_eyebrow_content';
import * as migration_20260909_092804_page_copy_schema from './20260909_092804_page_copy_schema';
import * as migration_20260909_120000_page_copy_content from './20260909_120000_page_copy_content';
import * as migration_20260909_130000_optional_open_source_description from './20260909_130000_optional_open_source_description';
import * as migration_20260916_121407_add_payload_mcp from './20260916_121407_add_payload_mcp';
import * as migration_20260918_091802_add_mcp_oauth_codes from './20260918_091802_add_mcp_oauth_codes';
import * as migration_20261111_110539_add_mcp_refresh_tokens from './20261111_110539_add_mcp_refresh_tokens';
import * as migration_20261111_190336_add_posts_last_modified from './20261111_190336_add_posts_last_modified';
import * as migration_20261111_215928_seo_person_fields from './20261111_215928_seo_person_fields';
import * as migration_20261111_221001_topics_taxonomy from './20261111_221001_topics_taxonomy';
import * as migration_20261111_234011_proof_points from './20261111_234011_proof_points';
import * as migration_20261112_100000_seo_default_metadata from './20261112_100000_seo_default_metadata';

export const migrations = [
  {
    up: migration_20260800_000000_locales_schema.up,
    down: migration_20260800_000000_locales_schema.down,
    name: '20260800_000000_locales_schema',
  },
  {
    up: migration_20260826_113000_post_category_directory.up,
    down: migration_20260826_113000_post_category_directory.down,
    name: '20260826_113000_post_category_directory',
  },
  {
    up: migration_20260826_120000_eyebrow_content.up,
    down: migration_20260826_120000_eyebrow_content.down,
    name: '20260826_120000_eyebrow_content',
  },
  {
    up: migration_20260909_092804_page_copy_schema.up,
    down: migration_20260909_092804_page_copy_schema.down,
    name: '20260909_092804_page_copy_schema',
  },
  {
    up: migration_20260909_120000_page_copy_content.up,
    down: migration_20260909_120000_page_copy_content.down,
    name: '20260909_120000_page_copy_content',
  },
  {
    up: migration_20260909_130000_optional_open_source_description.up,
    down: migration_20260909_130000_optional_open_source_description.down,
    name: '20260909_130000_optional_open_source_description',
  },
  {
    up: migration_20260916_121407_add_payload_mcp.up,
    down: migration_20260916_121407_add_payload_mcp.down,
    name: '20260916_121407_add_payload_mcp',
  },
  {
    up: migration_20260918_091802_add_mcp_oauth_codes.up,
    down: migration_20260918_091802_add_mcp_oauth_codes.down,
    name: '20260918_091802_add_mcp_oauth_codes',
  },
  {
    up: migration_20261111_110539_add_mcp_refresh_tokens.up,
    down: migration_20261111_110539_add_mcp_refresh_tokens.down,
    name: '20261111_110539_add_mcp_refresh_tokens',
  },
  {
    up: migration_20261111_190336_add_posts_last_modified.up,
    down: migration_20261111_190336_add_posts_last_modified.down,
    name: '20261111_190336_add_posts_last_modified',
  },
  {
    up: migration_20261111_215928_seo_person_fields.up,
    down: migration_20261111_215928_seo_person_fields.down,
    name: '20261111_215928_seo_person_fields',
  },
  {
    up: migration_20261111_221001_topics_taxonomy.up,
    down: migration_20261111_221001_topics_taxonomy.down,
    name: '20261111_221001_topics_taxonomy',
  },
  {
    up: migration_20261111_234011_proof_points.up,
    down: migration_20261111_234011_proof_points.down,
    name: '20261111_234011_proof_points',
  },
  {
    up: migration_20261112_100000_seo_default_metadata.up,
    down: migration_20261112_100000_seo_default_metadata.down,
    name: '20261112_100000_seo_default_metadata'
  },
];
