import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as tls from "@pulumi/tls";

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

const instance = new aws.ec2.Instance("instance", {
    instanceType: "t2.micro",
    ami: "ami-0e86e20dae9224db8",
    keyName: "new-pulumi", // real key pair
    securityGroups: [securityGroup.name],
    userData: `#!/bin/bash
    apt-get update -y
    `,
    tags:{
        Name: 'pulumi-adv'
    }
});

// Allocate an Elastic IP
// const elasticIp = new aws.ec2.Eip("myElasticIP");

// Associate the Elastic IP with the EC2 instance
// const eipAssociation = new aws.ec2.EipAssociation("myEipAssociation", {
//     instanceId: instance.id,
//     // allocationId: elasticIp.id,
// });

// Generate a new SSH key pair
const sshKey = new tls.PrivateKey("ssh-key", {
    algorithm: "RSA",
    rsaBits: 4096,
});

// Export the public key to associate with EC2
 export const privateKey = sshKey.privateKeyPem;


// Export the public IP of the instance
export const publicDns = instance.publicDns;
export const publicIp = instance.publicIp;