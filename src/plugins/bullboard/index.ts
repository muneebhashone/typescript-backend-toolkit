import type { ToolkitPlugin, PluginFactory } from '@/plugins/types';
import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { registeredQueues } from '@/lib/queue';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

export interface BullboardOptions {
  path: string;
}

export const bullboardPlugin: PluginFactory<BullboardOptions> = (
  options = { path: '/queues' },
): ToolkitPlugin<BullboardOptions> => {
  const { path } = options;

  return {
    name: 'bullboard',
    priority: 50,
    options,

    register({ app, port }) {
      const serverAdapter = new ExpressAdapter();
      serverAdapter.setBasePath(path);

      createBullBoard({
        queues: Object.entries(registeredQueues || {}).map(
          ([, values]) => new BullMQAdapter(values.queue),
        ),
        serverAdapter,
      });

      app.use(path, serverAdapter.getRouter());

      return [`http://localhost:${port}${path}`];
    },

    onShutdown: async () => {},
  };
};

export default bullboardPlugin;
