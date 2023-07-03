import React from "react";
import { Prisma } from "@prisma/client";
import { useAuthenticatedFetch } from "@saleor/app-sdk/app-bridge";
import { useQuery } from "react-query";
import { Box, Text } from "@saleor/macaw-ui/next";

const fetchJobs = (fetch: typeof window.fetch) =>
  fetch("/api/jobs").then((r: any) => r.json() as Prisma.IndexJob[]);

export const ImportHistory = () => {
  const fetch = useAuthenticatedFetch();

  const { data } = useQuery<Prisma.IndexJob[]>({
    queryFn: () => fetchJobs(fetch),
    refetchInterval: 5000,
  });

  if (!data) {
    return null;
  }

  return (
    <Box marginTop={8} as={"table"} width={"100%"}>
      <Box as={"thead"}>
        <td>
          <Text>Job ID</Text>
        </td>
        <td>
          <Text>Created at</Text>
        </td>
        <td>
          <Text>Createdy by</Text>
        </td>
        <td>
          <Text>Status</Text>
        </td>
      </Box>
      {data.map((job) => (
        <tr key={job.jobId}>
          <td>{job.jobId}</td>
          <td>
            {Intl.DateTimeFormat(["en"], { timeStyle: "medium", dateStyle: "medium" }).format(
              new Date(job.createdAt)
            )}
          </td>
          <td>{job.createdBy}</td>
          <td>{job.status}</td>
        </tr>
      ))}
    </Box>
  );
};
