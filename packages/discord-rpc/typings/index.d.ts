// Client Class
/**
 * Re-exports all members from the client module.
 * This includes core functionalities for interacting with Discord's RPC services.
 */
export * from './functions/client';

// Options Class
/**
 * Re-exports all members from the options module.
 * This includes configuration types and utilities for setting up the RPC client.
 */
export * from './options';

// Transport Class
/**
 * Re-exports the IPC transport module.
 * This transport is used for inter-process communication (IPC) with Discord's local client.
 */
export * from './transports/ipc';

// Registers
/**
 * Registers a new identifier for the Discord RPC system.
 * This is typically used for namespacing or associating specific functionality with an ID.
 * 
 * @param id - The identifier to register. This should be unique to avoid collisions.
 * @returns A formatted string that includes the identifier.
 * 
 * @example
 * ```typescript
 * const registrationId = register("example");
 * console.log(registrationId); // Output: "discord-example"
 * ```
 */
export function register(id: string): string;

/**
 * The currently installed version of the Discord RPC library.
 * This provides the version information as specified in the package metadata.
 * 
 * @example
 * ```typescript
 * import { version } from "dc-rpc";
 * console.log(version); // Output: "1.2.3" (example version)
 * ```
 */
export const version: string;
