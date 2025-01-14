import { SPECIAL_CONDITIONS } from '@/shared/types/special-conditions'
import { Badge } from '@/shared/ui/badge'
import { Card } from '@/shared/ui/card'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/shared/ui/tooltip'

export function SpecialConditionsLegend() {
    return (
        <Card className="p-2">
            <div className="grid grid-cols-7 gap-2">
                {SPECIAL_CONDITIONS.map((condition) => (
                    <TooltipProvider key={condition.symbol}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge 
                                    variant="outline" 
                                    className="text-sm hover:bg-gray-100"
                                >
                                    <span className="mr-1">{condition.symbol}</span>
                                    {condition.label}
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{condition.description}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>
        </Card>
    )
} 