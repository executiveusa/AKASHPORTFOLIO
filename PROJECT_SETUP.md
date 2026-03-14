## Dependencies Not Installing

If dependencies are not installing properly, instead of deleting the `package-lock.json` file and running `npm install`, use the following command for reproducible installs:

```bash
npm ci
```

This approach maintains the existing lockfile without deleting it, ensuring consistent installs across environments.