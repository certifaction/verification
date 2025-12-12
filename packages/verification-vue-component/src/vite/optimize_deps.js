import packageJson from '../../package.json' with { type: 'json' }

const dependencies = Object.keys(packageJson.dependencies)

export default {
    include: dependencies.filter(
        (dependency) => !['@certifaction/verification-core', '@certifaction/vue-pdf-viewer'].includes(dependency),
    ),
}
