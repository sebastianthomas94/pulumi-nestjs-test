import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Create an EC2 security group
const securityGroup = new aws.ec2.SecurityGroup("securityGroup", {
    ingress: [
        { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] }, // SSH
        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] }, // HTTP
        { protocol: "tcp", fromPort: 443, toPort: 443, cidrBlocks: ["0.0.0.0/0"] }, // HTTPS
        { protocol: "tcp", fromPort: 3000, toPort: 3000, cidrBlocks: ["0.0.0.0/0"] }, // HTTPS
    ],
});

// Fetch the latest Ubuntu AMI
const ami = aws.ec2.getAmi({
    mostRecent: true,
    owners: ["099720109477"], // Canonical
    filters: [{ name: "name", values: ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"] }],
});

const instance = new aws.ec2.Instance("instance", {
    instanceType: "t2.micro",
    ami: ami.then(ami => ami.id),
    keyName: "adv-pulumi", // real key pair
    securityGroups: [securityGroup.name],
    userData: `#!/bin/bash
    apt-get update -y
    `,
});

// Export the public IP of the instance
export const publicIp = instance.publicIp;
export const publicDns = instance.publicDns;