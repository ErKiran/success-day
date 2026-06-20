-- CreateTable
CREATE TABLE "ScimGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ScimGroupMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScimGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ScimGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScimGroupMember_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ScimGroup_displayName_key" ON "ScimGroup"("displayName");

-- CreateIndex
CREATE UNIQUE INDEX "ScimGroupMember_groupId_employeeId_key" ON "ScimGroupMember"("groupId", "employeeId");
