import React, { useState } from 'react';
import { FormCell, Input, Switch } from '../../src';
import './TestPreview.css';

const TestPreview: React.FC = () => {
    const [roundTrip, setRoundTrip] = useState(true);
    const [avoidTollRoads, setAvoidTollRoads] = useState(false);
    const [lastMileage, setLastMileage] = useState(true);

    return (
        <main className="test-preview">
            <h1 className="test-preview__title ts-600-3xl">Дополнительные условия</h1>

            <section className="form-cell-preview__group" aria-label="Дополнительные условия">
                <FormCell
                    variant="stack-top"
                    title="Туда-обратно"
                    description="Поездка туда и обратно"
                    right={<Switch label="Туда-обратно" isSelected={roundTrip} onChange={setRoundTrip} />}
                />
                <FormCell
                    variant="stack-middle"
                    title="Избегать платки"
                    right={<Switch label="Избегать платки" isSelected={avoidTollRoads} onChange={setAvoidTollRoads} />}
                />
                <FormCell
                    variant="stack-bottom"
                    title="Последний пробег"
                    right={<Switch label="Последний пробег" isSelected={lastMileage} onChange={setLastMileage} />}
                />
            </section>

            <Input
                label="Название фонда"
                placeholder="Введите название"
                description="Укажите название фонда так, как оно указано в документах. Это описание поможет отличить его от других фондов и будет видно только вам."
            />
        </main>
    );
};

export default TestPreview;
