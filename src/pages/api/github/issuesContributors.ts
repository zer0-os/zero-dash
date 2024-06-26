import { NextApiRequest, NextApiResponse } from 'next';
import { octokit } from '@/app/lib/github';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { organization, startDate, endDate } = req.query;

        if (!organization) {
            return res.status(400).json({ error: 'Organization parameter is required' });
        }

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date parameters are required' });
        }

        const startIso = new Date(startDate as string).toISOString();
        const endIso = new Date(endDate as string).toISOString();

        const repos = await octokit.repos.listForOrg({
            org: organization as string,
            type: 'all',
        });

        const issuesDataPromises = repos.data.map(async (repo) => {
            const issues = await octokit.issues.listForRepo({
                owner: organization as string,
                repo: repo.name,
                since: startIso,
                state: 'all'
            });

            const contributors = new Map();

            for (const issue of issues.data) {
                const issueCreatedAt = new Date(issue.created_at).toISOString();
                if (issueCreatedAt >= startIso && issueCreatedAt <= endIso) {
                    const author = issue.user?.login || 'unknown';
                    if (contributors.has(author)) {
                        contributors.set(author, contributors.get(author) + 1);
                    } else {
                        contributors.set(author, 1);
                    }
                }
            }

            return {
                repoName: repo.name,
                contributors: Array.from(contributors.entries()).map(([name, count]) => ({ name, count })),
            };
        });

        const issuesData = await Promise.all(issuesDataPromises);

        res.status(200).json(issuesData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from GitHub' });
    }
};
