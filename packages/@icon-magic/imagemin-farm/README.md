# @icon-magic/imagemin-farm

A process farm for image minification! Has two main methods exported:

## minify(path: string): Promise\<Result>

Given a path to a `png`, `jpg`, or `webp` file, minify the file. File will be modified in-place and replaced with the minified version of the file. Spins up `os.cpus() - 1` child processes to minify files. Minification tasks are transparently load balanced between processes. Promise will resolve with a `Result` object of the shape:

```typescript
interface Result {
  path: 'path-to-file';
  worker: number; // Worker PID of completed task;
  status: {
    // Status across all tasks
    total: number; // Total tasks
    remaining: number; // Remaining tasks
    progress: number; // Task progress between 0 and 1.
    workers: [
      {
        pid: number; // Worker PID
        total: number; // Total tasks for worker
        remaining: number; // Remaining tasks for worker
        progress: number | null; // Task progress of worker between 0 and 1
      }
      // repeats for number of workers...
    ];
  };
}
```

## subscribe(func: (res: ProcessStatus) => void): void

Subscribe a listener to recieve regular updates on process status. Good for updating progress bars. Recieves the `status` property of the `Results` object (defined above).
