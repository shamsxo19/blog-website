import React, { useState } from "react";
import { Link } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container, Input } from "../components";

function SearchUsers() {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (event) => {
        event.preventDefault();

        const term = searchTerm.trim();
        setHasSearched(true);

        if (!term) {
            setResults([]);
            return;
        }

        setIsSearching(true);

        try {
            const response = await appwriteService.searchProfiles(term);
            setResults(response?.documents || []);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="py-10">
            <Container>
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">Search Users</h1>
                        <p className="mt-2 text-slate-500">
                            Find other members by name and jump straight to their profile.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search by name"
                                className="sm:flex-1"
                            />
                            <Button type="submit" className="sm:min-w-[140px]">
                                {isSearching ? "Searching..." : "Search"}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8">
                        {!hasSearched && (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
                                Start typing a name to search for members.
                            </div>
                        )}

                        {hasSearched && !isSearching && results.length === 0 && (
                            <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
                                <h2 className="text-lg font-semibold text-slate-800">No users found</h2>
                                <p className="mt-2 text-sm text-slate-500">
                                    Try a different spelling or a shorter name.
                                </p>
                            </div>
                        )}

                        {results.length > 0 && (
                            <div className="space-y-4">
                                {results.map((profile) => (
                                    <Link
                                        key={profile.$id}
                                        to={`/users/${profile.userId}`}
                                        className="block rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <h2 className="text-lg font-semibold text-slate-900">{profile.name}</h2>
                                                <p className="mt-1 text-sm text-slate-500">View profile and posts</p>
                                            </div>
                                            <span className="text-sm font-medium text-indigo-600">Open profile</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
}

export default SearchUsers;
