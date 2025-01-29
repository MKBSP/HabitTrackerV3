
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const DATABASE_URL: string;
	export const PROD_PASS: string;
	export const npm_package_dependencies__supabase_auth_ui_shared: string;
	export const npm_package_dependencies_drizzle_orm: string;
	export const npm_package_devDependencies_prettier: string;
	export const rvm_use_flag: string;
	export const npm_package_dependencies_bits_ui: string;
	export const rvm_bin_path: string;
	export const TERM_PROGRAM: string;
	export const npm_package_devDependencies_eslint_plugin_svelte: string;
	export const NODE: string;
	export const rvm_quiet_flag: string;
	export const npm_package_devDependencies_prettier_plugin_svelte: string;
	export const npm_package_devDependencies_typescript: string;
	export const INIT_CWD: string;
	export const SHELL: string;
	export const TERM: string;
	export const rvm_gemstone_url: string;
	export const npm_package_scripts_db_generate: string;
	export const npm_package_devDependencies_vite: string;
	export const TMPDIR: string;
	export const rvm_docs_type: string;
	export const npm_package_devDependencies__types_d3_shape: string;
	export const npm_package_scripts_lint: string;
	export const TERM_PROGRAM_VERSION: string;
	export const npm_package_dependencies_tailwind_variants: string;
	export const npm_package_scripts_dev: string;
	export const npm_package_devDependencies_drizzle_kit: string;
	export const MallocNanoZone: string;
	export const ORIGINAL_XDG_CURRENT_DESKTOP: string;
	export const ZDOTDIR: string;
	export const rvm_hook: string;
	export const npm_package_dependencies_lucide_svelte: string;
	export const npm_package_private: string;
	export const npm_package_devDependencies__sveltejs_kit: string;
	export const npm_config_registry: string;
	export const ZSH: string;
	export const USER: string;
	export const npm_package_dependencies_d3_scale: string;
	export const rvm_gemstone_package_file: string;
	export const npm_package_scripts_check_watch: string;
	export const npm_package_dependencies_d3_axis: string;
	export const COMMAND_MODE: string;
	export const PNPM_SCRIPT_SRC_DIR: string;
	export const rvm_path: string;
	export const SSH_AUTH_SOCK: string;
	export const __CF_USER_TEXT_ENCODING: string;
	export const npm_package_devDependencies_eslint: string;
	export const npm_package_devDependencies_postcss: string;
	export const rvm_proxy: string;
	export const npm_package_devDependencies__typescript_eslint_eslint_plugin: string;
	export const npm_package_devDependencies_tslib: string;
	export const npm_execpath: string;
	export const PAGER: string;
	export const rvm_ruby_file: string;
	export const npm_package_devDependencies__types_d3_selection: string;
	export const npm_package_devDependencies_svelte: string;
	export const npm_package_dependencies__carbon_charts_svelte: string;
	export const LSCOLORS: string;
	export const npm_config_frozen_lockfile: string;
	export const rvm_prefix: string;
	export const rvm_silent_flag: string;
	export const npm_package_devDependencies__typescript_eslint_parser: string;
	export const npm_package_dependencies_d3_shape: string;
	export const npm_package_dependencies_tailwind_merge: string;
	export const PATH: string;
	export const rvm_ruby_make: string;
	export const __CFBundleIdentifier: string;
	export const USER_ZDOTDIR: string;
	export const PWD: string;
	export const npm_package_devDependencies_tailwindcss: string;
	export const npm_command: string;
	export const npm_package_scripts_preview: string;
	export const npm_package_dependencies__supabase_auth_ui_svelte: string;
	export const npm_lifecycle_event: string;
	export const LANG: string;
	export const rvm_sdk: string;
	export const npm_package_name: string;
	export const npm_package_devDependencies__sveltejs_vite_plugin_svelte: string;
	export const npm_package_dependencies_d3_selection: string;
	export const npm_package_dependencies_mode_watcher: string;
	export const NODE_PATH: string;
	export const npm_package_scripts_build: string;
	export const XPC_FLAGS: string;
	export const VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
	export const npm_package_dependencies__supabase_ssr: string;
	export const npm_package_engines_node: string;
	export const RBENV_SHELL: string;
	export const npm_package_devDependencies_eslint_config_prettier: string;
	export const npm_config_node_gyp: string;
	export const XPC_SERVICE_NAME: string;
	export const npm_package_version: string;
	export const npm_package_devDependencies__sveltejs_adapter_auto: string;
	export const rvm_version: string;
	export const VSCODE_INJECTION: string;
	export const npm_package_devDependencies_autoprefixer: string;
	export const npm_package_devDependencies_svelte_check: string;
	export const npm_package_dependencies_layercake: string;
	export const HOME: string;
	export const SHLVL: string;
	export const rvm_pretty_print_flag: string;
	export const rvm_script_name: string;
	export const npm_package_type: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const rvm_ruby_mode: string;
	export const npm_package_devDependencies__sveltejs_adapter_vercel: string;
	export const npm_package_devDependencies_supabase: string;
	export const npm_package_dependencies_d3: string;
	export const LOGNAME: string;
	export const LESS: string;
	export const npm_package_scripts_format: string;
	export const npm_package_dependencies__iconify_svelte: string;
	export const rvm_alias_expanded: string;
	export const npm_package_dependencies_zod: string;
	export const npm_package_dependencies_zod_form_data: string;
	export const npm_lifecycle_script: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const npm_package_devDependencies__types_d3_scale: string;
	export const npm_package_devDependencies_prettier_plugin_tailwindcss: string;
	export const npm_package_dependencies__supabase_supabase_js: string;
	export const rvm_nightly_flag: string;
	export const npm_config_user_agent: string;
	export const GIT_ASKPASS: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const rvm_ruby_make_install: string;
	export const npm_package_dependencies_clsx: string;
	export const DISPLAY: string;
	export const rvm_niceness: string;
	export const npm_package_devDependencies__types_eslint: string;
	export const rvm_ruby_bits: string;
	export const rvm_bin_flag: string;
	export const npm_package_dependencies_postgres: string;
	export const rvm_only_path_flag: string;
	export const npm_package_dependencies_svelte_preprocess: string;
	export const npm_package_scripts_check: string;
	export const npm_package_devDependencies__types_d3_axis: string;
	export const COLORTERM: string;
	export const npm_node_execpath: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	export const PUBLIC_SUPABASE_URL: string;
	export const PUBLIC_SUPABASE_ANON_KEY: string;
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		DATABASE_URL: string;
		PROD_PASS: string;
		npm_package_dependencies__supabase_auth_ui_shared: string;
		npm_package_dependencies_drizzle_orm: string;
		npm_package_devDependencies_prettier: string;
		rvm_use_flag: string;
		npm_package_dependencies_bits_ui: string;
		rvm_bin_path: string;
		TERM_PROGRAM: string;
		npm_package_devDependencies_eslint_plugin_svelte: string;
		NODE: string;
		rvm_quiet_flag: string;
		npm_package_devDependencies_prettier_plugin_svelte: string;
		npm_package_devDependencies_typescript: string;
		INIT_CWD: string;
		SHELL: string;
		TERM: string;
		rvm_gemstone_url: string;
		npm_package_scripts_db_generate: string;
		npm_package_devDependencies_vite: string;
		TMPDIR: string;
		rvm_docs_type: string;
		npm_package_devDependencies__types_d3_shape: string;
		npm_package_scripts_lint: string;
		TERM_PROGRAM_VERSION: string;
		npm_package_dependencies_tailwind_variants: string;
		npm_package_scripts_dev: string;
		npm_package_devDependencies_drizzle_kit: string;
		MallocNanoZone: string;
		ORIGINAL_XDG_CURRENT_DESKTOP: string;
		ZDOTDIR: string;
		rvm_hook: string;
		npm_package_dependencies_lucide_svelte: string;
		npm_package_private: string;
		npm_package_devDependencies__sveltejs_kit: string;
		npm_config_registry: string;
		ZSH: string;
		USER: string;
		npm_package_dependencies_d3_scale: string;
		rvm_gemstone_package_file: string;
		npm_package_scripts_check_watch: string;
		npm_package_dependencies_d3_axis: string;
		COMMAND_MODE: string;
		PNPM_SCRIPT_SRC_DIR: string;
		rvm_path: string;
		SSH_AUTH_SOCK: string;
		__CF_USER_TEXT_ENCODING: string;
		npm_package_devDependencies_eslint: string;
		npm_package_devDependencies_postcss: string;
		rvm_proxy: string;
		npm_package_devDependencies__typescript_eslint_eslint_plugin: string;
		npm_package_devDependencies_tslib: string;
		npm_execpath: string;
		PAGER: string;
		rvm_ruby_file: string;
		npm_package_devDependencies__types_d3_selection: string;
		npm_package_devDependencies_svelte: string;
		npm_package_dependencies__carbon_charts_svelte: string;
		LSCOLORS: string;
		npm_config_frozen_lockfile: string;
		rvm_prefix: string;
		rvm_silent_flag: string;
		npm_package_devDependencies__typescript_eslint_parser: string;
		npm_package_dependencies_d3_shape: string;
		npm_package_dependencies_tailwind_merge: string;
		PATH: string;
		rvm_ruby_make: string;
		__CFBundleIdentifier: string;
		USER_ZDOTDIR: string;
		PWD: string;
		npm_package_devDependencies_tailwindcss: string;
		npm_command: string;
		npm_package_scripts_preview: string;
		npm_package_dependencies__supabase_auth_ui_svelte: string;
		npm_lifecycle_event: string;
		LANG: string;
		rvm_sdk: string;
		npm_package_name: string;
		npm_package_devDependencies__sveltejs_vite_plugin_svelte: string;
		npm_package_dependencies_d3_selection: string;
		npm_package_dependencies_mode_watcher: string;
		NODE_PATH: string;
		npm_package_scripts_build: string;
		XPC_FLAGS: string;
		VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
		npm_package_dependencies__supabase_ssr: string;
		npm_package_engines_node: string;
		RBENV_SHELL: string;
		npm_package_devDependencies_eslint_config_prettier: string;
		npm_config_node_gyp: string;
		XPC_SERVICE_NAME: string;
		npm_package_version: string;
		npm_package_devDependencies__sveltejs_adapter_auto: string;
		rvm_version: string;
		VSCODE_INJECTION: string;
		npm_package_devDependencies_autoprefixer: string;
		npm_package_devDependencies_svelte_check: string;
		npm_package_dependencies_layercake: string;
		HOME: string;
		SHLVL: string;
		rvm_pretty_print_flag: string;
		rvm_script_name: string;
		npm_package_type: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		rvm_ruby_mode: string;
		npm_package_devDependencies__sveltejs_adapter_vercel: string;
		npm_package_devDependencies_supabase: string;
		npm_package_dependencies_d3: string;
		LOGNAME: string;
		LESS: string;
		npm_package_scripts_format: string;
		npm_package_dependencies__iconify_svelte: string;
		rvm_alias_expanded: string;
		npm_package_dependencies_zod: string;
		npm_package_dependencies_zod_form_data: string;
		npm_lifecycle_script: string;
		VSCODE_GIT_IPC_HANDLE: string;
		npm_package_devDependencies__types_d3_scale: string;
		npm_package_devDependencies_prettier_plugin_tailwindcss: string;
		npm_package_dependencies__supabase_supabase_js: string;
		rvm_nightly_flag: string;
		npm_config_user_agent: string;
		GIT_ASKPASS: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		rvm_ruby_make_install: string;
		npm_package_dependencies_clsx: string;
		DISPLAY: string;
		rvm_niceness: string;
		npm_package_devDependencies__types_eslint: string;
		rvm_ruby_bits: string;
		rvm_bin_flag: string;
		npm_package_dependencies_postgres: string;
		rvm_only_path_flag: string;
		npm_package_dependencies_svelte_preprocess: string;
		npm_package_scripts_check: string;
		npm_package_devDependencies__types_d3_axis: string;
		COLORTERM: string;
		npm_node_execpath: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		PUBLIC_SUPABASE_URL: string;
		PUBLIC_SUPABASE_ANON_KEY: string;
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
