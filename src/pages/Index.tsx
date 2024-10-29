import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrgStats, getRepoStats, getTeamMembers } from "@/lib/github";
import { StatCard } from "@/components/StatCard";
import { RepoChart } from "@/components/RepoChart";
import { ContributorsChart } from "@/components/ContributorsChart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Users,
  GitFork,
  Star,
  GitPullRequest,
  Building2,
} from "lucide-react";

const Index = () => {
  const [orgName, setOrgName] = useState("vercel");
  const [searchOrg, setSearchOrg] = useState("vercel");
  const { toast } = useToast();

  const { data: orgStats, isLoading: loadingOrg } = useQuery({
    queryKey: ["org", searchOrg],
    queryFn: () => getOrgStats(searchOrg),
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load organization data. Please check the organization name.",
        variant: "destructive",
      });
    },
  });

  const { data: repoStats, isLoading: loadingRepos } = useQuery({
    queryKey: ["repos", searchOrg],
    queryFn: () => getRepoStats(searchOrg),
    enabled: !!orgStats,
  });

  const { data: teamMembers, isLoading: loadingMembers } = useQuery({
    queryKey: ["members", searchOrg],
    queryFn: () => getTeamMembers(searchOrg),
    enabled: !!orgStats,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOrg(orgName);
  };

  const isLoading = loadingOrg || loadingRepos || loadingMembers;

  return (
    <div className="min-h-screen bg-github-50">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">GitHub Organization Dashboard</h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Enter organization name..."
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="max-w-xs"
            />
            <Button type="submit">Search</Button>
          </form>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          orgStats && (
            <div className="space-y-8">
              <div className="grid gap-4 md:grid-cols-4">
                <StatCard
                  title="Total Repositories"
                  value={orgStats.repoCount}
                  icon={<GitFork className="h-4 w-4 text-github-500" />}
                />
                <StatCard
                  title="Members"
                  value={orgStats.memberCount}
                  icon={<Users className="h-4 w-4 text-github-500" />}
                />
                <StatCard
                  title="Teams"
                  value={orgStats.teamCount}
                  icon={<Building2 className="h-4 w-4 text-github-500" />}
                />
                {repoStats && (
                  <StatCard
                    title="Total Stars"
                    value={repoStats.reduce((acc, repo) => acc + repo.stars, 0)}
                    icon={<Star className="h-4 w-4 text-github-500" />}
                  />
                )}
              </div>

              {repoStats && (
                <div className="grid gap-4 md:grid-cols-4">
                  <RepoChart
                    data={repoStats}
                    dataKey="stars"
                    title="Repository Stars"
                    color="#FFB84C"
                  />
                  <RepoChart
                    data={repoStats}
                    dataKey="forks"
                    title="Repository Forks"
                    color="#7286D3"
                  />
                </div>
              )}

              {teamMembers && teamMembers.length > 0 && (
                <div className="grid gap-4 md:grid-cols-4">
                  <ContributorsChart data={teamMembers} />
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Index;