import * as migration_20260800_000000_locales_schema from './20260800_000000_locales_schema';
import * as migration_20260826_113000_post_category_directory from './20260826_113000_post_category_directory';
import * as migration_20260826_120000_eyebrow_content from './20260826_120000_eyebrow_content';
import * as migration_20260909_092804_page_copy_schema from './20260909_092804_page_copy_schema';
import * as migration_20260909_120000_page_copy_content from './20260909_120000_page_copy_content';
import * as migration_20260909_130000_optional_open_source_description from './20260909_130000_optional_open_source_description';
import * as migration_20260916_121407_add_payload_mcp from './20260916_121407_add_payload_mcp';
import * as migration_20260918_091802_add_mcp_oauth_codes from './20260918_091802_add_mcp_oauth_codes';

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
    name: '20260918_091802_add_mcp_oauth_codes'
  },
];
