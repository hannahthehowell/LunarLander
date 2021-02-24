function ParticleSystem(spec) {
    let that = {};
    let particles = [];

    that.center = spec.center;
    that.range = spec.range;
    that.isCreateNewParticles = spec.isCreateNewParticles;

    function create(spec) {
        let that = {};

        spec.fill = 'rgb(255, 255, 255)';
        spec.stroke = 'rgb(0, 0, 0)';
        spec.alive = 0;

        that.update = function(elapsedTime) {
            spec.center.x += (spec.speed * spec.direction.x * elapsedTime);
            spec.center.y += (spec.speed * spec.direction.y * elapsedTime);
            spec.alive += elapsedTime;

            spec.rotation += spec.speed * 0.5;

            return spec.alive < spec.lifetime;
        };

        that.draw = function() {
            //graphics.drawRectangle(spec);
            drawTexture(spec.image, spec.center, spec.rotation, spec.size);
        };

        return that;
    }

    that.update = function(elapsedTime) {
        let keepMe = [];
        for (let particle = 0; particle < particles.length; particle++) {
            if (particles[particle].update(elapsedTime)) {
                keepMe.push(particles[particle]);
            }
        }
        particles = keepMe;

        function nextCircleVector(range) {
            let start = range.start;
            let end = range.end;
            let angle = Math.random() * (end - start) + start;

            return {
                x: Math.sin(angle),
                y: Math.cos(angle)
            };
        }

        if (that.isCreateNewParticles) {
            for (let particle = 0; particle < 5; particle++) {
                let size = Math.abs(Random.nextGaussian(spec.size.mean, spec.size.stdev));
                let p = create({
                    image: spec.image,
                    center: {x: spec.center.x, y: spec.center.y},
                    size: {x: size, y: size},
                    rotation: 0,
                    speed: Math.abs(Random.nextGaussian(spec.speed.mean, spec.speed.stdev)),
                    direction: nextCircleVector(spec.range),
                    lifetime: Random.nextGaussian(spec.lifetime.mean, spec.lifetime.stdev)
                });
                particles.push(p);
            }
        }
    };

    that.render = function() {
        for (let p = particles.length - 1; p >= 0; p--) {
            particles[p].draw();
        }
    };

    return that;
}

function drawTexture(image, center, rotation, size) {
    contextF.save();

    contextF.translate(center.x, center.y);
    contextF.rotate(rotation);
    contextF.translate(-center.x, -center.y);

    contextF.drawImage(
        image,
        center.x - size.x / 2,
        center.y - size.y / 2,
        size.x, size.y);

    contextF.restore();
}
