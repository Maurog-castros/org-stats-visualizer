import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN,
});

export interface OrgStats {
  name: string;
  description: string;
  avatarUrl: string;
  repoCount: number;
  memberCount: number;
  teamCount: number;
}

export interface RepoStats {
  name: string;
  stars: number;
  forks: number;
  issues: number;
  commits: number;
  contributors: number;
}

export interface TeamMember {
  login: string;
  avatarUrl: string;
  contributions: number;
}

export const getOrgStats = async (orgName: string): Promise<OrgStats> => {
  const { data: org } = await octokit.orgs.get({ org: orgName });
  const { data: members } = await octokit.orgs.listMembers({ org: orgName });
  const { data: teams } = await octokit.teams.list({ org: orgName });

  return {
    name: org.name || org.login,
    description: org.description || "",
    avatarUrl: org.avatar_url,
    repoCount: org.public_repos,
    memberCount: members.length,
    teamCount: teams.length,
  };
};

export const getRepoStats = async (orgName: string): Promise<RepoStats[]> => {
  const { data: repos } = await octokit.repos.listForOrg({ org: orgName });
  
  const repoStats = await Promise.all(
    repos.slice(0, 10).map(async (repo) => {
      const [{ data: commits }, { data: contributors }] = await Promise.all([
        octokit.repos.listCommits({ owner: orgName, repo: repo.name }),
        octokit.repos.listContributors({ owner: orgName, repo: repo.name }),
      ]);

      return {
        name: repo.name,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        issues: repo.open_issues_count,
        commits: commits.length,
        contributors: contributors.length,
      };
    })
  );

  return repoStats;
};

export const getTeamMembers = async (orgName: string): Promise<TeamMember[]> => {
  const { data: members } = await octokit.orgs.listMembers({ org: orgName });
  
  const memberStats = await Promise.all(
    members.map(async (member) => {
      const { data: contributions } = await octokit.repos.listCommits({
        owner: orgName,
        repo: "",
        author: member.login,
      });

      return {
        login: member.login,
        avatarUrl: member.avatar_url,
        contributions: contributions.length,
      };
    })
  );

  return memberStats;
};